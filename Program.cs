using System;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Threading.Tasks;
using Microsoft.Data.Sqlite;
using Dapper;
using Photino.NET;
using DotNetEnv;

namespace MiraverseOSx
{
    // C# Model mapped to your SQLite Documents table
    public class Document
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Extension { get; set; } = string.Empty;
        public string Folder { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public int Is_Encrypted { get; set; }
        public int Is_Prism_Flagged { get; set; }
        public string Faction_Origin { get; set; } = string.Empty;
        public string Region_Origin { get; set; } = string.Empty;
        public string Created_At { get; set; } = string.Empty;
    }

    class Program
    {
        private static PhotinoWindow? _mainWindow;
        private static HttpListener? _httpServer;
        private static int _activePort = 5000;
        private static readonly HttpClient _httpClient = new HttpClient();

        [STAThread]
        static void Main(string[] args)
        {
            // 1. Load .env environment variables immediately
            try
            {
                string envPath = Path.Combine(Directory.GetCurrentDirectory(), ".env");
                if (File.Exists(envPath))
                {
                    Env.Load(envPath);
                }
                else
                {
                    Env.Load();
                }
                Console.WriteLine("[Environment] Loaded .env configuration.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Environment Warning] Failed to load .env: {ex.Message}");
            }

            // 2. Start lightweight local HTTP server for wwwroot assets and API
            _activePort = StartLocalWebServer();

            // 3. Initialize Photino native desktop window
            _mainWindow = new PhotinoWindow()
                .SetTitle("Miraverse OS x - Celestial Operating System")
                .SetUseOsDefaultSize(false)
                .SetSize(1440, 900)
                .Center()
                .SetResizable(true);

            // 4. Register web message IPC bridge handler
            _mainWindow.RegisterWebMessageReceivedHandler(OnWebMessageReceived);

            // 5. Load app from local web server
            string localUrl = $"http://localhost:{_activePort}/index.html";
            _mainWindow.Load(localUrl);

            _mainWindow.WaitForClose();

            // 6. Cleanup server on exit
            StopLocalWebServer();
        }

        private static int StartLocalWebServer()
        {
            string wwwroot = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "wwwroot");
            if (!Directory.Exists(wwwroot))
            {
                wwwroot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            }

            int port = 5000;
            for (int p = 5000; p <= 5015; p++)
            {
                try
                {
                    _httpServer = new HttpListener();
                    _httpServer.Prefixes.Add($"http://localhost:{p}/");
                    _httpServer.Start();
                    port = p;
                    Console.WriteLine($"[Local Server] Serving wwwroot from '{wwwroot}' on http://localhost:{p}/");
                    break;
                }
                catch
                {
                    try { _httpServer?.Close(); } catch { }
                    _httpServer = null;
                }
            }

            if (_httpServer != null)
            {
                Task.Run(() =>
                {
                    while (_httpServer != null && _httpServer.IsListening)
                    {
                        try
                        {
                            var context = _httpServer.GetContext();
                            Task.Run(() => ProcessHttpRequest(context, wwwroot));
                        }
                        catch { }
                    }
                });
            }

            return port;
        }

        private static async void ProcessHttpRequest(HttpListenerContext context, string wwwroot)
        {
            try
            {
                string relPath = context.Request.Url?.AbsolutePath.TrimStart('/') ?? "index.html";

                // --- SQLITE API ROUTE INTERCEPTOR ---
                if (relPath.Equals("api/documents", StringComparison.OrdinalIgnoreCase))
                {
                    string dbPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "miraverse.db");
                    if (!File.Exists(dbPath))
                    {
                        dbPath = Path.Combine(Directory.GetCurrentDirectory(), "miraverse.db");
                    }

                    using var connection = new SqliteConnection($"Data Source={dbPath}");
                    var docs = connection.Query<Document>("SELECT * FROM Documents");

                    byte[] jsonBytes = JsonSerializer.SerializeToUtf8Bytes(docs);

                    context.Response.ContentType = "application/json";
                    context.Response.ContentLength64 = jsonBytes.Length;
                    context.Response.OutputStream.Write(jsonBytes, 0, jsonBytes.Length);
                    context.Response.OutputStream.Close();
                    return;
                }

                // --- BLOCKCHAIR SECURE CRYPTO ROUTE ---
                if (relPath.Equals("api/crypto", StringComparison.OrdinalIgnoreCase))
                {
                    // Safely grab key from environment variable
                    string apiKey = Environment.GetEnvironmentVariable("BLOCKCHAIR_API_KEY") ?? "";
                    string blockchairUrl = string.IsNullOrWhiteSpace(apiKey)
                        ? "https://api.blockchair.com/bitcoin/stats"
                        : $"https://api.blockchair.com/bitcoin/stats?key={apiKey}";

                    try
                    {
                        HttpResponseMessage response = await _httpClient.GetAsync(blockchairUrl);
                        string jsonResponse = await response.Content.ReadAsStringAsync();

                        byte[] responseBytes = Encoding.UTF8.GetBytes(jsonResponse);
                        context.Response.ContentType = "application/json";
                        context.Response.ContentLength64 = responseBytes.Length;
                        using var output = context.Response.OutputStream;
                        output.Write(responseBytes, 0, responseBytes.Length);
                    }
                    catch (Exception ex)
                    {
                        context.Response.StatusCode = 500;
                        Console.WriteLine($"[Crypto API Error] Error fetching crypto data: {ex.Message}");
                        byte[] errBytes = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(new { error = ex.Message }));
                        context.Response.ContentType = "application/json";
                        context.Response.ContentLength64 = errBytes.Length;
                        using var output = context.Response.OutputStream;
                        output.Write(errBytes, 0, errBytes.Length);
                    }
                    finally
                    {
                        try { context.Response.Close(); } catch { }
                    }
                    return;
                }

                // --- STATIC FILE HANDLING ---
                if (string.IsNullOrEmpty(relPath)) relPath = "index.html";

                string filePath = Path.Combine(wwwroot, relPath.Replace('/', Path.DirectorySeparatorChar));
                if (!File.Exists(filePath))
                {
                    filePath = Path.Combine(wwwroot, "index.html");
                }

                byte[] bytes = File.ReadAllBytes(filePath);
                string ext = Path.GetExtension(filePath).ToLowerInvariant();
                context.Response.ContentType = ext switch
                {
                    ".html" => "text/html",
                    ".js" => "application/javascript",
                    ".css" => "text/css",
                    ".png" => "image/png",
                    ".jpg" or ".jpeg" => "image/jpeg",
                    ".svg" => "image/svg+xml",
                    ".json" => "application/json",
                    ".mp4" => "video/mp4",
                    ".ttf" => "font/ttf",
                    _ => "application/octet-stream"
                };

                context.Response.ContentLength64 = bytes.Length;
                context.Response.OutputStream.Write(bytes, 0, bytes.Length);
                context.Response.OutputStream.Close();
            }
            catch
            {
                try { context.Response.StatusCode = 404; context.Response.Close(); } catch { }
            }
        }

        private static void StopLocalWebServer()
        {
            try
            {
                _httpServer?.Stop();
                _httpServer?.Close();
            }
            catch { }
        }

        private static async void OnWebMessageReceived(object? sender, string rawMessage)
        {
            try
            {
                var jsonNode = JsonNode.Parse(rawMessage);
                if (jsonNode == null) return;

                string action = jsonNode["action"]?.ToString() ?? "";
                var payload = jsonNode["payload"]?.AsObject();

                // Echo back native system acknowledgment
                var ack = JsonSerializer.Serialize(new
                {
                    action = $"{action}_ack",
                    payload = new { status = "received", timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds() }
                });

                _mainWindow?.SendWebMessage(ack);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[IPC Error] {ex.Message}");
            }
        }
    }
}