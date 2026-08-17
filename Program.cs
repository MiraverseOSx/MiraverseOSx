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
using Appwrite;
using Appwrite.Services;

namespace MiraverseOSx
{
    // C# Model mapped to your SQLite Documents table / Appwrite Collection
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

        // --- APPWRITE SERVICE INSTANCES ---
        public static Client AppwriteClient { get; private set; } = null!;
        public static Account AppwriteAccount { get; private set; } = null!;
        public static Databases AppwriteDatabases { get; private set; } = null!;

        // Appwrite Cloud configuration (NYC regional endpoint)
        private const string AppwriteEndpoint = "https://nyc.cloud.appwrite.io/v1";
        private const string AppwriteProjectId = "6a8217de003313795046";

        [STAThread]
        static void Main(string[] args)
        {
            // 1. Initialize Appwrite Client & Services
            InitializeAppwrite();

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

        private static void InitializeAppwrite()
        {
            try
            {
                AppwriteClient = new Client()
                    .SetEndpoint(AppwriteEndpoint)
                    .SetProject(AppwriteProjectId);

                AppwriteAccount = new Account(AppwriteClient);
                AppwriteDatabases = new Databases(AppwriteClient);

                Console.WriteLine("[Appwrite] SDK successfully initialized.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Appwrite Init Error] {ex.Message}");
            }
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

        private static void ProcessHttpRequest(HttpListenerContext context, string wwwroot)
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

                // Example: Handle Appwrite cloud sync via IPC bridge
                if (action == "sync_cloud_documents")
                {
                    // Logic to query Appwrite Databases or trigger async sync
                    Console.WriteLine("[IPC] Cloud document synchronization triggered.");
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
    }
}