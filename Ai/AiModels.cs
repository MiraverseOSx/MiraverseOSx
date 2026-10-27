using System.Text.Json.Serialization;

namespace MiraverseOSx.Ai
{
    public class AiChatRequest
    {
        [JsonPropertyName("npc")]
        public string Npc { get; set; } = "Mai";

        [JsonPropertyName("prompt")]
        public string Prompt { get; set; } = string.Empty;

        [JsonPropertyName("activeApp")]
        public string ActiveApp { get; set; } = "desktop";

        [JsonPropertyName("context")]
        public string Context { get; set; } = string.Empty;

        [JsonPropertyName("contextScope")]
        public string ContextScope { get; set; } = string.Empty;

        [JsonPropertyName("preferredProvider")]
        public string? PreferredProvider { get; set; }

        [JsonPropertyName("maxTokens")]
        public int? MaxTokens { get; set; }
    }

    public class TokenUsage
    {
        [JsonPropertyName("prompt")]
        public int Prompt { get; set; }

        [JsonPropertyName("completion")]
        public int Completion { get; set; }

        [JsonPropertyName("total")]
        public int Total => Prompt + Completion;
    }

    public class AiChatResponse
    {
        [JsonPropertyName("npc")]
        public string Npc { get; set; } = string.Empty;

        [JsonPropertyName("text")]
        public string Text { get; set; } = string.Empty;

        [JsonPropertyName("provider")]
        public string Provider { get; set; } = string.Empty;

        [JsonPropertyName("model")]
        public string Model { get; set; } = string.Empty;

        [JsonPropertyName("tokens")]
        public TokenUsage Tokens { get; set; } = new();

        [JsonPropertyName("estimatedCostUsd")]
        public double EstimatedCostUsd { get; set; }

        [JsonPropertyName("memoriesUsed")]
        public List<string> MemoriesUsed { get; set; } = new();

        [JsonPropertyName("cached")]
        public bool Cached { get; set; }

        [JsonPropertyName("latencyMs")]
        public long LatencyMs { get; set; }
    }

    public class NpcMemoryRecord
    {
        public string Id { get; set; } = string.Empty;
        public string NpcId { get; set; } = string.Empty;
        public string PlayerId { get; set; } = "player";
        public string MemoryType { get; set; } = "episodic";
        public string Content { get; set; } = string.Empty;
        public double Importance { get; set; } = 1.0;
        public string CreatedAt { get; set; } = string.Empty;
    }

    public class AiCostLogRecord
    {
        public string Id { get; set; } = string.Empty;
        public string Provider { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public int PromptTokens { get; set; }
        public int CompletionTokens { get; set; }
        public double CostUsd { get; set; }
        public string Timestamp { get; set; } = string.Empty;
    }

    public class AiTelemetryResponse
    {
        [JsonPropertyName("dailyBudgetUsd")]
        public double DailyBudgetUsd { get; set; }

        [JsonPropertyName("dailySpentUsd")]
        public double DailySpentUsd { get; set; }

        [JsonPropertyName("budgetRemainingUsd")]
        public double BudgetRemainingUsd => Math.Max(0.0, DailyBudgetUsd - DailySpentUsd);

        [JsonPropertyName("budgetExceeded")]
        public bool BudgetExceeded => DailySpentUsd >= DailyBudgetUsd;

        [JsonPropertyName("totalRequestsToday")]
        public int TotalRequestsToday { get; set; }

        [JsonPropertyName("cacheHitsToday")]
        public int CacheHitsToday { get; set; }

        [JsonPropertyName("geminiConfigured")]
        public bool GeminiConfigured { get; set; }

        [JsonPropertyName("openAiConfigured")]
        public bool OpenAiConfigured { get; set; }

        [JsonPropertyName("activeProvider")]
        public string ActiveProvider { get; set; } = string.Empty;
    }
}
