using System;
using System.Collections.Generic;
using System.IO;
using Microsoft.Data.Sqlite;

namespace MiraverseOSx.Ai
{
    public class NpcMemoryRepository
    {
        private readonly string _connectionString;

        public NpcMemoryRepository(string dataDirectory)
        {
            Directory.CreateDirectory(dataDirectory);
            string dbPath = Path.Combine(dataDirectory, "ai-memory.db");
            _connectionString = new SqliteConnectionStringBuilder
            {
                DataSource = dbPath,
                DefaultTimeout = 5
            }.ToString();

            InitializeDatabase();
        }

        private SqliteConnection Open()
        {
            var conn = new SqliteConnection(_connectionString);
            conn.Open();
            return conn;
        }

        private void InitializeDatabase()
        {
            using var conn = Open();
            using var cmd = conn.CreateCommand();
            cmd.CommandText = """
                PRAGMA journal_mode=WAL;
                CREATE TABLE IF NOT EXISTS NpcMemories (
                    Id TEXT PRIMARY KEY,
                    NpcId TEXT NOT NULL,
                    PlayerId TEXT NOT NULL,
                    MemoryType TEXT NOT NULL,
                    Content TEXT NOT NULL,
                    Importance REAL NOT NULL,
                    CreatedAt TEXT NOT NULL
                );
                CREATE INDEX IF NOT EXISTS idx_npc_memories ON NpcMemories (NpcId, Importance DESC, CreatedAt DESC);

                CREATE TABLE IF NOT EXISTS AiCostLogs (
                    Id TEXT PRIMARY KEY,
                    Provider TEXT NOT NULL,
                    Model TEXT NOT NULL,
                    PromptTokens INTEGER NOT NULL,
                    CompletionTokens INTEGER NOT NULL,
                    CostUsd REAL NOT NULL,
                    Timestamp TEXT NOT NULL
                );
                CREATE INDEX IF NOT EXISTS idx_cost_timestamp ON AiCostLogs (Timestamp);
            """;
            cmd.ExecuteNonQuery();

            SeedDefaultMemories(conn);
        }

        private void SeedDefaultMemories(SqliteConnection conn)
        {
            using var countCmd = conn.CreateCommand();
            countCmd.CommandText = "SELECT COUNT(*) FROM NpcMemories";
            long count = (long)(countCmd.ExecuteScalar() ?? 0L);
            if (count > 0) return;

            var defaultMemories = new (string Npc, string Type, string Content, double Importance)[]
            {
                ("Mai", "fact", "MAI is the celestial OS taskbar companion monitoring Aureline PRISM resonance.", 2.5),
                ("Mai", "relational", "Player is a verified citizen exploring the Meridion OS operating environment.", 2.0),
                ("Jeremie", "fact", "Jeremie Belpois maintains the terminal logic and signal bus routing across the network.", 2.5),
                ("Jeremie", "episodic", "Player frequently builds, repairs, and inspects circuit schematics in the workshop.", 1.8),
                ("Aelita", "fact", "Aelita Schaeffer studies harmonic audio waveforms and peaceful botanical memories.", 2.5),
                ("Aelita", "relational", "Player appreciates ambient piano melodies and quiet reflections.", 1.8),
                ("Sissi", "fact", "Elisabeth Delmas curates the social calendar, glamour, and weekend social feed.", 2.0),
                ("Vaelen", "fact", "Vaelen is an Orynvell SpellForge scholar researching elemental arcana glyphs.", 2.2),
                ("Kaelen", "fact", "Kaelen operates shadow grid broker channels out of the Versenet perimeter.", 2.2)
            };

            string now = DateTime.UtcNow.ToString("o");
            using var tx = conn.BeginTransaction();
            foreach (var mem in defaultMemories)
            {
                using var insert = conn.CreateCommand();
                insert.Transaction = tx;
                insert.CommandText = """
                    INSERT INTO NpcMemories (Id, NpcId, PlayerId, MemoryType, Content, Importance, CreatedAt)
                    VALUES ($id, $npc, 'player', $type, $content, $imp, $time);
                """;
                insert.Parameters.AddWithValue("$id", Guid.NewGuid().ToString("N"));
                insert.Parameters.AddWithValue("$npc", mem.Npc.ToLowerInvariant());
                insert.Parameters.AddWithValue("$type", mem.Type);
                insert.Parameters.AddWithValue("$content", mem.Content);
                insert.Parameters.AddWithValue("$imp", mem.Importance);
                insert.Parameters.AddWithValue("$time", now);
                insert.ExecuteNonQuery();
            }
            tx.Commit();
        }

        public List<NpcMemoryRecord> GetTopMemories(string npcId, int limit = 5)
        {
            var results = new List<NpcMemoryRecord>();
            string norm = npcId.Trim().ToLowerInvariant();

            using var conn = Open();
            using var cmd = conn.CreateCommand();
            cmd.CommandText = """
                SELECT Id, NpcId, PlayerId, MemoryType, Content, Importance, CreatedAt
                FROM NpcMemories
                WHERE NpcId = $npc
                ORDER BY Importance DESC, CreatedAt DESC
                LIMIT $limit;
            """;
            cmd.Parameters.AddWithValue("$npc", norm);
            cmd.Parameters.AddWithValue("$limit", limit);

            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                results.Add(new NpcMemoryRecord
                {
                    Id = reader.GetString(0),
                    NpcId = reader.GetString(1),
                    PlayerId = reader.GetString(2),
                    MemoryType = reader.GetString(3),
                    Content = reader.GetString(4),
                    Importance = reader.GetDouble(5),
                    CreatedAt = reader.GetString(6)
                });
            }

            return results;
        }

        public void AddMemory(string npcId, string content, string type = "episodic", double importance = 1.0, string playerId = "player")
        {
            string norm = npcId.Trim().ToLowerInvariant();
            using var conn = Open();
            using var cmd = conn.CreateCommand();
            cmd.CommandText = """
                INSERT INTO NpcMemories (Id, NpcId, PlayerId, MemoryType, Content, Importance, CreatedAt)
                VALUES ($id, $npc, $player, $type, $content, $imp, $time);
            """;
            cmd.Parameters.AddWithValue("$id", Guid.NewGuid().ToString("N"));
            cmd.Parameters.AddWithValue("$npc", norm);
            cmd.Parameters.AddWithValue("$player", playerId);
            cmd.Parameters.AddWithValue("$type", type);
            cmd.Parameters.AddWithValue("$content", content);
            cmd.Parameters.AddWithValue("$imp", importance);
            cmd.Parameters.AddWithValue("$time", DateTime.UtcNow.ToString("o"));
            cmd.ExecuteNonQuery();
        }

        public void LogCost(string provider, string model, int promptTokens, int completionTokens, double costUsd)
        {
            using var conn = Open();
            using var cmd = conn.CreateCommand();
            cmd.CommandText = """
                INSERT INTO AiCostLogs (Id, Provider, Model, PromptTokens, CompletionTokens, CostUsd, Timestamp)
                VALUES ($id, $provider, $model, $promptTokens, $completionTokens, $costUsd, $time);
            """;
            cmd.Parameters.AddWithValue("$id", Guid.NewGuid().ToString("N"));
            cmd.Parameters.AddWithValue("$provider", provider);
            cmd.Parameters.AddWithValue("$model", model);
            cmd.Parameters.AddWithValue("$promptTokens", promptTokens);
            cmd.Parameters.AddWithValue("$completionTokens", completionTokens);
            cmd.Parameters.AddWithValue("$costUsd", costUsd);
            cmd.Parameters.AddWithValue("$time", DateTime.UtcNow.ToString("o"));
            cmd.ExecuteNonQuery();
        }

        public (double TotalSpend, int TotalRequests) GetDailyMetrics(DateTime dateUtc)
        {
            string dayStart = dateUtc.ToString("yyyy-MM-ddT00:00:00Z");
            string dayEnd = dateUtc.ToString("yyyy-MM-ddT23:59:59Z");

            using var conn = Open();
            using var cmd = conn.CreateCommand();
            cmd.CommandText = """
                SELECT COALESCE(SUM(CostUsd), 0.0), COUNT(*)
                FROM AiCostLogs
                WHERE Timestamp >= $start AND Timestamp <= $end;
            """;
            cmd.Parameters.AddWithValue("$start", dayStart);
            cmd.Parameters.AddWithValue("$end", dayEnd);

            using var reader = cmd.ExecuteReader();
            if (reader.Read())
            {
                return (reader.GetDouble(0), reader.GetInt32(1));
            }
            return (0.0, 0);
        }
    }
}
