using System;
using System.IO;
using System.Text.Json;
using System.Text.Json.Nodes;
using Photino.NET;
using Python.Included;
using Python.Runtime;

namespace MiraverseOSx
{
    class Program
    {
        private static PhotinoWindow? _mainWindow;

        [STAThread]
        static void Main(string[] args)
        {
            // Initialize Photino native window
            _mainWindow = new PhotinoWindow()
                .SetTitle("Miraverse OS x - Celestial Operating System")
                .SetUseOsDefaultSize(false)
                .SetSize(1440, 900)
                .Center()
                .SetResizable(true);

            // Setup Python.Included embedded engine background thread or process bridge
            InitializePythonEngine();

            // Register web message IPC bridge handler
            _mainWindow.RegisterWebMessageReceivedHandler(OnWebMessageReceived);

            // Path to wwwroot index.html
            string wwwrootPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "wwwroot", "index.html");
            if (!File.Exists(wwwrootPath))
            {
                // Fallback to project root wwwroot if running in dev environment
                wwwrootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "index.html");
            }

            if (File.Exists(wwwrootPath))
            {
                _mainWindow.Load(wwwrootPath);
            }
            else
            {
                _mainWindow.LoadRawString(@"
                    <html>
                        <body style='font-family: sans-serif; background: #0f172a; color: #f8fafc; padding: 2rem;'>
                            <h1>MiraverseOSx Bridge Initialized</h1>
                            <p>wwwroot/index.html not found. Please build the frontend using <code>npm run build</code> inside the <code>frontend</code> folder.</p>
                        </body>
                    </html>
                ");
            }

            _mainWindow.WaitForClose();
        }

        private static void InitializePythonEngine()
        {
            try
            {
                Installer.SetupPython().Wait();
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
                Console.WriteLine($"[Python Engine Warning] Embedded Python initialization notice: {ex.Message}. Falling back to dynamic message handling.");
            }
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
                        text = $"[Mai System]: Signal received for prompt '{payload?["prompt"]}'. Biometric link verified."
                    }
                },
                _ => new { action = "ack", payload = new { status = "received" } }
            };

            return JsonSerializer.Serialize(responseObj);
        }
    }
}
