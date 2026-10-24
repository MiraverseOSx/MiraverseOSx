using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Threading;
using System.Threading.Tasks;

namespace MiraverseOSx.Ai
{
    public class GeminiProvider
    {
        private readonly HttpClient _httpClient;
        private readonly string? _initialApiKey;
        private readonly string? _initialModel;

        public GeminiProvider(HttpClient httpClient)
        {
            _httpClient = httpClient;
            _initialApiKey = Environment.GetEnvironmentVariable("GEMINI_API_KEY");
            _initialModel = Environment.GetEnvironmentVariable("GEMINI_MODEL");
        }

        private string? ApiKey => Environment.GetEnvironmentVariable("GEMINI_API_KEY") ?? _initialApiKey;
        public bool IsConfigured => !string.IsNullOrWhiteSpace(ApiKey);
        public string ModelName => Environment.GetEnvironmentVariable("GEMINI_MODEL") ?? _initialModel ?? "gemini-flash-lite-latest";

        public async Task<(string Text, int PromptTokens, int CompletionTokens)> GenerateAsync(
            string systemPrompt,
            string userPrompt,
            int maxTokens = 120,
            CancellationToken cancellationToken = default)
        {
            var apiKey = ApiKey;
            if (string.IsNullOrWhiteSpace(apiKey))
            {
                throw new InvalidOperationException("GEMINI_API_KEY is not configured.");
            }

            string endpoint = $"https://generativelanguage.googleapis.com/v1beta/models/{ModelName}:generateContent?key={apiKey}";

            var requestBody = new
            {
                system_instruction = new
                {
                    parts = new[] { new { text = systemPrompt } }
                },
                contents = new[]
                {
                    new
                    {
                        role = "user",
                        parts = new[] { new { text = userPrompt } }
                    }
                },
                generationConfig = new
                {
                    temperature = 0.7,
                    maxOutputTokens = Math.Max(maxTokens, 256)
                }
            };

            string jsonPayload = JsonSerializer.Serialize(requestBody);
            using var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

            using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            cts.CancelAfter(TimeSpan.FromSeconds(15));

            HttpResponseMessage response = await _httpClient.PostAsync(endpoint, content, cts.Token);
            string responseBody = await response.Content.ReadAsStringAsync(cts.Token);

            if (!response.IsSuccessStatusCode)
            {
                throw new HttpRequestException($"Gemini API error (Status {response.StatusCode}): {responseBody}");
            }

            var root = JsonNode.Parse(responseBody);
            var sb = new StringBuilder();

            var parts = root?["candidates"]?[0]?["content"]?["parts"]?.AsArray();
            if (parts != null)
            {
                foreach (var part in parts)
                {
                    if (part?["thought"]?.GetValue<bool>() == true) continue;
                    var partText = part?["text"]?.ToString();
                    if (!string.IsNullOrEmpty(partText))
                    {
                        sb.Append(partText);
                    }
                }
            }

            string generatedText = sb.Length > 0
                ? sb.ToString()
                : (root?["candidates"]?[0]?["content"]?["parts"]?[0]?["text"]?.ToString() ?? string.Empty);

            int promptTokens = root?["usageMetadata"]?["promptTokenCount"]?.GetValue<int>() ?? (systemPrompt.Length + userPrompt.Length) / 4;
            int completionTokens = root?["usageMetadata"]?["candidatesTokenCount"]?.GetValue<int>() ?? generatedText.Length / 4;

            return (generatedText.Trim(), promptTokens, completionTokens);
        }
    }
}
