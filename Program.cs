using System;
using System.IO;
using System.Net;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Threading.Tasks;
using Photino.NET;
using Python.Included;
using Python.Runtime;

namespace MiraverseOSx
{
    class Program
    {
        private static PhotinoWindow? _mainWindow;
        private static HttpListener? _httpServer;
        private const int ServerPort = 5000;

        [STAThread]
        static void Main(string[] args)
        {
            // Start lightweight local HTTP server for wwwroot assets
            StartLocalWebServer();

            // Initialize Photino native window
            _mainWindow = new PhotinoWindow()
                .SetTitle("Miraverse OS x - Celestial Operating System")
                .SetUseOsDefaultSize(false)
                .SetSize(1440, 900)
                .Center()
                .SetResizable(true);

            // Initialize Python Engine asynchronously
            InitializePythonEngine();

            // Register web message IPC bridge handler
            _mainWindow.RegisterWebMessageReceivedHandler(OnWebMessageReceived);

            // Load app from local web server or file fallback
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
                    ".mp4" => "video/mp4",
                    ".ttf" => "font/ttf",
                    ".json" => "application/json",
                    _ => "application/octet-stream"
                };

                context.Response.ContentLength64 = bytes.Length;
                context.Response.OutputStream.Write(bytes, 0, bytes.Length);
                context.Response.OutputStream.Close();
            }
            catch
            {
                context.Response.StatusCode = 500;
                context.Response.Close();
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

        private static void InitializePythonEngine()
        {
            Task.Run(async () =>
            {
                try
                {
                    await Installer.SetupPython();
                    PythonEngine.Initialize();
                    PythonEngine.BeginAllowThreads();

                    using (Py.GIL())
                    {
                        dynamic sys = Py.Import("sys");
                        string baseDir = Directory.GetCurrentDirectory();
                        string gameLogicDir = Path.Combine(baseDir, "game_logic");
                        sys.path.append(gameLogicDir);
                        sys.path.append(baseDir);
                    }
                    Console.WriteLine("[Python Engine] Successfully initialized embedded Python runtime.");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[Python Engine Notice] {ex.Message}. Using C# fallback engine.");
                }
            });
        }

        private static void OnWebMessageReceived(object? sender, string rawMessage)
        {
            try
            {
                var jsonNode = JsonNode.Parse(rawMessage);
                if (jsonNode == null) return;

                string action = jsonNode["action"]?.ToString() ?? "";
                var payload = jsonNode["payload"]?.AsObject();

                string responseJson = ProcessPythonLogic(action, payload);
                _mainWindow?.SendWebMessage(responseJson);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[IPC Error] {ex.Message}");
            }
        }

        private static string ProcessPythonLogic(string action, JsonObject? payload)
        {
            try
            {
                if (PythonEngine.IsInitialized)
                {
                    using (Py.GIL())
                    {
                        dynamic gameLogic = Py.Import("game_logic");

                        if (action == "calculate_tick")
                        {
                            dynamic tickData = gameLogic.calculate_tick();
                            return JsonSerializer.Serialize(new
                            {
                                action = "tick_result",
                                payload = JsonSerializer.Deserialize<JsonElement>(tickData.ToString())
                            });
                        }
                        else if (action == "generate_mission")
                        {
                            int level = payload?["level"]?.GetValue<int>() ?? 1;
                            dynamic missionData = gameLogic.create_procedural_mission(level);
                            return JsonSerializer.Serialize(new
                            {
                                action = "mission_result",
                                payload = JsonSerializer.Deserialize<JsonElement>(missionData.ToString())
                            });
                        }
                        else if (action == "npc_dialogue")
                        {
                            string npc = payload?["npc"]?.ToString() ?? "Mai";
                            string prompt = payload?["prompt"]?.ToString() ?? "Hello";
                            dynamic npcData = gameLogic.get_npc_response(npc, prompt);
                            return JsonSerializer.Serialize(new
                            {
                                action = "npc_result",
                                payload = JsonSerializer.Deserialize<JsonElement>(npcData.ToString())
                            });
                        }
                        else if (action == "calculate_resolution")
                        {
                            string element = payload?["element"]?.ToString() ?? "Fire";
                            int power = payload?["power"]?.GetValue<int>() ?? 50;
                            int runeLevel = payload?["runeLevel"]?.GetValue<int>() ?? 1;
                            int playerLevel = payload?["playerLevel"]?.GetValue<int>() ?? 1;
                            double corruption = payload?["corruption"]?.GetValue<double>() ?? 0.0;

                            dynamic resData = gameLogic.resolve_spell(element, power, runeLevel, playerLevel, corruption);
                            return JsonSerializer.Serialize(new
                            {
                                action = "resolution_result",
                                payload = JsonSerializer.Deserialize<JsonElement>(resData.ToString())
                            });
                        }
                    }
                }
            }
            catch (Exception pyEx)
            {
                Console.WriteLine($"[Python GIL Exec Warning] {pyEx.Message}");
            }

            // Fallback C# Response Handler
            return ExecuteFallbackLogic(action, payload);
        }

        private static string ExecuteFallbackLogic(string action, JsonObject? payload)
        {
            var random = new Random();
            object responseObj = action switch
            {
                "calculate_tick" => new
                {
                    action = "tick_result",
                    payload = new
                    {
                        tick = random.Next(1, 1000),
                        timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
                        state = new
                        {
                            corruption_level = Math.Round(10.0 + random.NextDouble() * 5.0, 2),
                            prism_harmonic = Math.Round(80.0 + random.NextDouble() * 15.0, 2),
                            aether_density = 1024.0,
                            astral_phase = "Solstice Alignment",
                            weather_condition = "Aureline Clear",
                            active_anomalies = 2
                        }
                    }
                },
                "generate_mission" => new
                {
                    action = "mission_result",
                    payload = new
                    {
                        id = $"MIS-{random.Next(1000, 9999)}",
                        title = "Operation PRISM Resonance",
                        type = "Infiltration",
                        region = "Aureline Core",
                        faction = "DGA High Command",
                        difficulty = "Adept",
                        description = "Procedural field mission routed through Photino bridge.",
                        rewards = new { xp = 300, credits = 500, item = "Aura Credits" },
                        status = "Available"
                    }
                },
                "npc_dialogue" => new
                {
                    action = "npc_result",
                    payload = new
                    {
                        npc = payload?["npc"]?.ToString() ?? "Mai",
                        source = "photino_csharp_fallback",
                        text = $"[{payload?["npc"] ?? "Mai"}]: Received message '{payload?["prompt"]}'. Synchronized with Photino matrix."
                    }
                },
                "calculate_resolution" => new
                {
                    action = "resolution_result",
                    payload = new
                    {
                        element = payload?["element"]?.ToString() ?? "Fire",
                        final_power = (payload?["power"]?.GetValue<int>() ?? 50) * 1.35,
                        is_critical = random.NextDouble() < 0.2,
                        efficiency = 92.5
                    }
                },
                _ => new { action = "ack", payload = new { status = "received" } }
            };

            return JsonSerializer.Serialize(responseObj);
        }
    }
}
