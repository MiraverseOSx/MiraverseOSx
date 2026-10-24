using System;
using System.Collections.Concurrent;
using System.Security.Cryptography;
using System.Text;

namespace MiraverseOSx.Ai
{
    public class AiCostController
    {
        private readonly NpcMemoryRepository _repo;
        private readonly double _dailyBudgetUsd;
        private readonly ConcurrentDictionary<string, (string Text, string Model, string Provider, DateTime CachedAt)> _cache = new();
        private int _cacheHitsToday = 0;
        private readonly TimeSpan _cacheTtl = TimeSpan.FromMinutes(15);

        public AiCostController(NpcMemoryRepository repo)
        {
            _repo = repo;
            string budgetEnv = Environment.GetEnvironmentVariable("AI_DAILY_BUDGET_USD") ?? "1.00";
            if (!double.TryParse(budgetEnv, out _dailyBudgetUsd))
            {
                _dailyBudgetUsd = 1.00;
            }
        }

        public double DailyBudgetUsd => _dailyBudgetUsd;
        public int CacheHitsToday => _cacheHitsToday;

        public bool IsBudgetExceeded()
        {
            var (spend, _) = _repo.GetDailyMetrics(DateTime.UtcNow);
            return spend >= _dailyBudgetUsd;
        }

        public double CalculateCost(string model, int promptTokens, int completionTokens)
        {
            string m = (model ?? "").ToLowerInvariant();

            double promptRate = 0.0000001; // default $0.10 / 1M
            double completionRate = 0.0000004; // default $0.40 / 1M

            if (m.Contains("gemini-2") || m.Contains("gemini-3") || m.Contains("gemini-flash") || m.Contains("gemini"))
            {
                promptRate = 0.0000001; // $0.10 / 1M
                completionRate = 0.0000004; // $0.40 / 1M
            }
            else if (m.Contains("gpt-4o-mini"))
            {
                promptRate = 0.00000015; // $0.15 / 1M
                completionRate = 0.0000006; // $0.60 / 1M
            }
            else if (m.Contains("gpt-4o"))
            {
                promptRate = 0.0000025; // $2.50 / 1M
                completionRate = 0.00001; // $10.00 / 1M
            }

            return Math.Round((promptTokens * promptRate) + (completionTokens * completionRate), 7);
        }

        public void RecordCost(string provider, string model, int promptTokens, int completionTokens, double costUsd)
        {
            _repo.LogCost(provider, model, promptTokens, completionTokens, costUsd);
        }

        public bool TryGetCachedResponse(string npc, string prompt, string activeApp, out (string Text, string Model, string Provider) cached)
        {
            string key = ComputeCacheKey(npc, prompt, activeApp);
            if (_cache.TryGetValue(key, out var entry))
            {
                if (DateTime.UtcNow - entry.CachedAt < _cacheTtl)
                {
                    Interlocked.Increment(ref _cacheHitsToday);
                    cached = (entry.Text, entry.Model, entry.Provider);
                    return true;
                }
                _cache.TryRemove(key, out _);
            }

            cached = default;
            return false;
        }

        public void StoreInCache(string npc, string prompt, string activeApp, string text, string model, string provider)
        {
            string key = ComputeCacheKey(npc, prompt, activeApp);
            _cache[key] = (text, model, provider, DateTime.UtcNow);
        }

        private static string ComputeCacheKey(string npc, string prompt, string activeApp)
        {
            string raw = $"{npc.Trim().ToLowerInvariant()}|{prompt.Trim().ToLowerInvariant()}|{activeApp.Trim().ToLowerInvariant()}";
            using var sha = SHA256.Create();
            byte[] hash = sha.ComputeHash(Encoding.UTF8.GetBytes(raw));
            return Convert.ToHexString(hash);
        }
    }
}
