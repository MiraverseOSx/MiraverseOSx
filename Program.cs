using System;
using System.IO;
using System.Net;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Threading.Tasks;
using Microsoft.Data.Sqlite;
using Dapper;
using Photino.NET;

namespace MiraverseOSx
{
    // C# Model mapped to your SQLite Documents table
    public class Document
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Extension { get; set; }
        public string Folder { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public string Author { get; set; }
        public int Is_Encrypted { get; set; }
        public int Is_Prism_Flagged { get; set; }
        public string Faction_Origin { get; set; }
        public string Region_Origin { get; set; }
        public string Created_At { get; set; }
    }

    class Program
    {
        private static PhotinoWindow? _mainWindow;
        private static HttpListener? _httpServer;
        private const int ServerPort = 5000;

        [STAThread]
        static void Main(string[] args)
        {
            // Start lightweight local HTTP server for wwwroot assets and API
            StartLocalWebServer();

            // Initialize Photino native desktop window
            _mainWindow = new PhotinoWindow()
                .SetTitle("Miraverse OS x - Celestial Operating System")
                .SetUseOsDefaultSize(false)
                .SetSize(1440, 900)
                .Center()
                .SetResizable(true);

            // Register web message IPC bridge handler
            _mainWindow.RegisterWebMessageReceivedHandler(OnWebMessageReceived);

            // Load app from local web server
            string localUrl = $"http://localhost:{ServerPort}/index.html";
            _mainWindow.Load(localUrl);

            _mainWindow.WaitForClose();

            // Cleanup server on exit
            StopLocalWebServer();
        }

        private static void StartLocalWebServer()
        {
            Task.Run(() =>
            {
                try
                {
                    string wwwroot = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "wwwroot");
                    if (!Directory.Exists(wwwroot))
                    {
                        wwwroot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                    }

                    _httpServer = new HttpListener();
                    _httpServer.Prefixes.Add($"http://localhost:{ServerPort}/");
                    _httpServer.Start();
                    Console.WriteLine($"[Local Server] Serving wwwroot from '{wwwroot}' on http://localhost:{ServerPort}/");

                    while (_httpServer.IsListening)
                    {
                        var context = _httpServer.GetContext();
                        Task.Run(() => ProcessHttpRequest(context, wwwroot));
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[Local Server Notice] {ex.Message}");
                }
            });
        }

        private static void ProcessHttpRequest(HttpListenerContext context, string wwwroot)
        {
            try
            {
                string relPath = context.Request.Url?.AbsolutePath.TrimStart('/') ?? "index.html";

                // --- SQLITE API ROUTE INTERCEPTOR ---
                if (relPath.Equals("api/documents", StringComparison.OrdinalIgnoreCase))
                {
                    // Find SQLite db in base directory or project root
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

        private static void OnWebMessageReceived(object? sender, string rawMessage)
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