using System;
using System.Net;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace MiraverseOSx.Ai
{
    public class AiHttpHandler
    {
        private readonly AiRouterService _router;
        private static readonly JsonSerializerOptions JsonOptions = new()
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            PropertyNameCaseInsensitive = true
        };

        public AiHttpHandler(AiRouterService router)
        {
            _router = router;
        }

        public async Task<bool> Handle(HttpListenerContext context, string relPath)
        {
            if (!relPath.StartsWith("api/ai/", StringComparison.OrdinalIgnoreCase))
            {
                return false;
            }

            var request = context.Request;
            var response = context.Response;

            // CORS headers for Vite dev server & native client
            response.Headers["Access-Control-Allow-Origin"] = "*";
            response.Headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS";
            response.Headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization";

            if (request.HttpMethod == "OPTIONS")
            {
                response.StatusCode = 204;
                response.Close();
                return true;
            }

            try
            {
                if (relPath.Equals("api/ai/chat", StringComparison.OrdinalIgnoreCase) && request.HttpMethod == "POST")
                {
                    using var reader = new System.IO.StreamReader(request.InputStream, request.ContentEncoding);
                    string rawJson = await reader.ReadToEndAsync();
                    var chatReq = JsonSerializer.Deserialize<AiChatRequest>(rawJson, JsonOptions) ?? new AiChatRequest();

                    var chatRes = await _router.ChatAsync(chatReq);
                    await SendJsonResponse(response, 200, chatRes);
                    return true;
                }

                if (relPath.Equals("api/ai/memories", StringComparison.OrdinalIgnoreCase) && request.HttpMethod == "GET")
                {
                    string npc = request.QueryString["npc"] ?? "Mai";
                    int limit = int.TryParse(request.QueryString["limit"], out var l) ? l : 5;
                    var memories = _router.MemoryRepo.GetTopMemories(npc, limit);
                    await SendJsonResponse(response, 200, new { npc, memories });
                    return true;
                }

                if (relPath.Equals("api/ai/memory", StringComparison.OrdinalIgnoreCase) && request.HttpMethod == "POST")
                {
                    using var reader = new System.IO.StreamReader(request.InputStream, request.ContentEncoding);
                    string rawJson = await reader.ReadToEndAsync();
                    var memReq = JsonDocument.Parse(rawJson).RootElement;

                    string npc = memReq.GetProperty("npc").GetString() ?? "Mai";
                    string content = memReq.GetProperty("content").GetString() ?? "";
                    string type = memReq.TryGetProperty("type", out var t) ? (t.GetString() ?? "episodic") : "episodic";
                    double importance = memReq.TryGetProperty("importance", out var imp) ? imp.GetDouble() : 1.0;

                    _router.MemoryRepo.AddMemory(npc, content, type, importance);
                    await SendJsonResponse(response, 200, new { success = true, message = $"Memory added for {npc}." });
                    return true;
                }

                if (relPath.Equals("api/ai/telemetry", StringComparison.OrdinalIgnoreCase) && request.HttpMethod == "GET")
                {
                    var (spend, count) = _router.MemoryRepo.GetDailyMetrics(DateTime.UtcNow);
                    bool geminiOk = !string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("GEMINI_API_KEY"));
                    bool openAiOk = !string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("OPENAI_API_KEY"));
                    string active = geminiOk ? "google-gemini" : (openAiOk ? "openai" : "native-persona");

                    var telemetry = new AiTelemetryResponse
                    {
                        DailyBudgetUsd = _router.CostController.DailyBudgetUsd,
                        DailySpentUsd = spend,
                        TotalRequestsToday = count,
                        CacheHitsToday = _router.CostController.CacheHitsToday,
                        GeminiConfigured = geminiOk,
                        OpenAiConfigured = openAiOk,
                        ActiveProvider = active
                    };

                    await SendJsonResponse(response, 200, telemetry);
                    return true;
                }

                await SendJsonResponse(response, 404, new { error = "Unknown AI route." });
                return true;
            }
            catch (ArgumentException ex)
            {
                await SendJsonResponse(response, 400, new { error = ex.Message });
                return true;
            }
            catch (Exception ex)
            {
                await SendJsonResponse(response, 500, new { error = ex.Message });
                return true;
            }
        }

        private static async Task SendJsonResponse(HttpListenerResponse response, int statusCode, object data)
        {
            response.StatusCode = statusCode;
            response.ContentType = "application/json";
            byte[] bytes = JsonSerializer.SerializeToUtf8Bytes(data, JsonOptions);
            response.ContentLength64 = bytes.Length;
            await response.OutputStream.WriteAsync(bytes, 0, bytes.Length);
            response.OutputStream.Close();
        }
    }
}
