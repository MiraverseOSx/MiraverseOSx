using System;
using System.IO;
using System.Diagnostics;
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
        private static WorldSaveApi? _worldApi;
        private static readonly HttpClient _httpClient = new HttpClient();
        private static readonly string _externalLaunchToken = Guid.NewGuid().ToString("N");

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

            string? Argument(string name) { int index = Array.IndexOf(args, name); return index >= 0 && index + 1 < args.Length ? args[index + 1] : null; }
            var dataDirectory = Argument("--data-dir") ?? Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "MiraverseOSx");
            _worldApi = new WorldSaveApi(dataDirectory);
            var serverOnly = Array.Exists(args, value => value == "--server-only");
            int requestedPort = int.TryParse(Argument("--port"), out var parsedPort) && parsedPort is >= 1024 and <= 65535 ? parsedPort : 5000;
            // Native windows use their server's own origin; Vite targets the fixed development port.
            _activePort = StartLocalWebServer(requestedPort, serverOnly);
            if (serverOnly)
            {
                using var shutdown = new System.Threading.ManualResetEventSlim();
                Console.CancelKeyPress += (_, eventArgs) => { eventArgs.Cancel = true; shutdown.Set(); };
                shutdown.Wait(); StopLocalWebServer(); return;
            }

            // 3. Initialize Photino native desktop window
            _mainWindow = new PhotinoWindow()
                .SetTitle("Miraverse OS x - Celestial Operating System")
                .SetUseOsDefaultSize(false)
                .SetSize(1920, 1080)
                .Center()
                .SetResizable(true);

            // 4. Register web message IPC bridge handler
            _mainWindow.RegisterWebMessageReceivedHandler(OnWebMessageReceived);

            // 5. Load app from local web server
            string localUrl = $"http://localhost:{_activePort}/index.html";
            _mainWindow.Load($"{localUrl}?nativeLaunchToken={_externalLaunchToken}");

            _mainWindow.WaitForClose();

            // 6. Cleanup server on exit
            StopLocalWebServer();
        }

        private static int StartLocalWebServer(int requestedPort, bool fixedPort)
        {
            string wwwroot = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "wwwroot");
            if (!Directory.Exists(wwwroot))
            {
                wwwroot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            }

            int port = requestedPort;
            for (int p = requestedPort; p <= (fixedPort ? requestedPort : Math.Min(requestedPort + 15, 65535)); p++)
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

            if (_httpServer == null) throw new InvalidOperationException($"Could not start the local backend on port {requestedPort}.");
            return port;
        }

        private static async void ProcessHttpRequest(HttpListenerContext context, string wwwroot)
        {
            try
            {
                string relPath = context.Request.Url?.AbsolutePath.TrimStart('/') ?? "index.html";

                if (_worldApi != null && await _worldApi.Handle(context, relPath)) return;

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

                if (relPath.StartsWith("api/", StringComparison.OrdinalIgnoreCase)) { await WorldSaveApi.Reply(context.Response, 404, new { error = "Unknown API route." }); return; }

                // --- STATIC FILE HANDLING ---
                if (string.IsNullOrEmpty(relPath)) relPath = "index.html";

                string filePath = Path.GetFullPath(Path.Combine(wwwroot, Uri.UnescapeDataString(relPath).Replace('/', Path.DirectorySeparatorChar)));
                string allowedRoot = Path.GetFullPath(wwwroot).TrimEnd(Path.DirectorySeparatorChar) + Path.DirectorySeparatorChar;
                if (!filePath.StartsWith(allowedRoot, StringComparison.OrdinalIgnoreCase)) { context.Response.StatusCode = 403; context.Response.Close(); return; }
                if (!File.Exists(filePath))
                {
                    if (Path.HasExtension(relPath)) { context.Response.StatusCode = 404; context.Response.Close(); return; }
                    filePath = Path.Combine(wwwroot, "index.html");
                }

                context.Response.Headers["X-Content-Type-Options"] = "nosniff";
                if (relPath == "sw.js" || relPath == "index.html") context.Response.Headers["Cache-Control"] = "no-cache";
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

                if (action == "open_external")
                {
                    var status = "rejected";
                    var target = payload?["url"]?.ToString() ?? "";
                    if (payload?["token"]?.ToString() == _externalLaunchToken && TryExternalLaunchTarget(target, out var launchTarget))
                    {
                        try { Process.Start(new ProcessStartInfo(launchTarget) { UseShellExecute = true }); status = "opened"; }
                        catch { status = "failed"; }
                    }
                    _mainWindow?.SendWebMessage(JsonSerializer.Serialize(new { action = "open_external_ack", requestId = jsonNode["requestId"]?.ToString(), payload = new { status } }));
                    return;
                }

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

        internal static bool TryExternalLaunchTarget(string target, out string launchTarget)
        {
            launchTarget = "";
            if (target.Length > 4096 || !Uri.TryCreate(target, UriKind.Absolute, out var uri) || !string.IsNullOrEmpty(uri.UserInfo)) return false;
            if (uri.Scheme == "http" || uri.Scheme == "https")
            {
                var host = uri.Host.ToLowerInvariant();
                if (host.EndsWith(".aure") || host.EndsWith(".mer") || host.EndsWith(".onion") || new[] { "versenet", "civinet", "questnotice", "royalhistory", "dga.gov", "cyacademy.edu", "records.orynvell.gov", "finance.oryn.gov", "mai.space" }.Contains(host)) return false;
                launchTarget = uri.AbsoluteUri; return true;
            }
            // Explicit local HTML links only; never hand executable paths or network shares to the shell.
            if (!uri.IsFile || uri.IsUnc || !string.IsNullOrEmpty(uri.Host) || uri.Query.Length > 0 || uri.Fragment.Length > 0) return false;
            var extension = Path.GetExtension(uri.LocalPath);
            if (!extension.Equals(".html", StringComparison.OrdinalIgnoreCase) && !extension.Equals(".htm", StringComparison.OrdinalIgnoreCase)) return false;
            if (!File.Exists(uri.LocalPath)) return false;
            launchTarget = uri.LocalPath; return true;
        }
    }
}
