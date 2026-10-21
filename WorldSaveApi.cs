using System.Net;
using System.Text;
using System.Text.Json;
using Microsoft.Data.Sqlite;

namespace MiraverseOSx;

// One local world is committed atomically, including cross-app receipts and files.
internal sealed class WorldSaveApi
{
    private const int MaxBytes = 16 * 1024 * 1024;
    private readonly string connectionString;
    private readonly string serverId;
    private static readonly HashSet<string> Keys = new(StringComparer.Ordinal)
    {
        "miraverse-os-progress", "miraverse-comms", "miraverse-phone-preferences",
        "miraverse-canonical-identities-v1", "miraverse-identity-registry-v3", "miraverse-maid-counter-OR",
        "DGAOS_WORKSTATION_STATE_V3", "trace_active_case_data_v2"
    };
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
    public WorldSaveApi(string directory)
    {
        Directory.CreateDirectory(directory);
        connectionString = new SqliteConnectionStringBuilder { DataSource = Path.Combine(directory, "world-saves.db"), DefaultTimeout = 5 }.ToString();
        using var db = Open();
        using var command = db.CreateCommand();
        command.CommandText = """
            PRAGMA journal_mode=WAL;
            CREATE TABLE IF NOT EXISTS SaveMetadata (Id INTEGER PRIMARY KEY CHECK(Id=1), ServerId TEXT NOT NULL);
            CREATE TABLE IF NOT EXISTS WorldSaves (Id INTEGER PRIMARY KEY CHECK(Id=1), Revision INTEGER NOT NULL, UpdatedAt TEXT NOT NULL, Entries TEXT NOT NULL);
            CREATE TABLE IF NOT EXISTS WorldSaveHistory (Revision INTEGER PRIMARY KEY, UpdatedAt TEXT NOT NULL, Entries TEXT NOT NULL);
            INSERT OR IGNORE INTO SaveMetadata(Id, ServerId) VALUES (1, $server);
            """;
        command.Parameters.AddWithValue("$server", Guid.NewGuid().ToString());
        command.ExecuteNonQuery();
        command.CommandText = "SELECT ServerId FROM SaveMetadata WHERE Id=1";
        serverId = (string)command.ExecuteScalar()!;
    }
    private SqliteConnection Open() { var db = new SqliteConnection(connectionString); db.Open(); return db; }
    private WorldSnapshot Read(SqliteConnection db, SqliteTransaction? transaction = null)
    {
        using var command = db.CreateCommand(); command.Transaction = transaction;
        command.CommandText = "SELECT Revision, UpdatedAt, Entries FROM WorldSaves WHERE Id=1";
        using var reader = command.ExecuteReader();
        return reader.Read() ? new(serverId, reader.GetInt64(0), reader.GetString(1), JsonSerializer.Deserialize<Dictionary<string, string>>(reader.GetString(2))!) : new(serverId, 0, null, new());
    }
    public async Task<bool> Handle(HttpListenerContext context, string path)
    {
        if (path != "api/world" && path != "api/health") return false;
        var request = context.Request; var response = context.Response;
        response.Headers["Cache-Control"] = "no-store";
        response.Headers["X-Content-Type-Options"] = "nosniff";
        if (!request.IsLocal || !AllowedOrigin(request.Headers["Origin"], request.Url?.Port ?? 5000))
        { await Reply(response, 403, new { error = "This API is available only to the local Miraverse app." }); return true; }
        if (request.HttpMethod == "OPTIONS") { response.StatusCode = 204; response.Close(); return true; }
        if (path == "api/health") { await Reply(response, request.HttpMethod == "GET" ? 200 : 405, new { service = "miraverse-world", schemaVersion = 1 }); return true; }
        try
        {
            if (request.HttpMethod == "GET") { using var db = Open(); await Reply(response, 200, Read(db)); return true; }
            if (request.HttpMethod != "PUT") { await Reply(response, 405, new { error = "Use GET or PUT." }); return true; }
            if (request.ContentType?.Split(';')[0].Trim() != "application/json") { await Reply(response, 415, new { error = "A JSON world save is required." }); return true; }
            if (request.ContentLength64 > MaxBytes) { await Reply(response, 413, new { error = "The world save is too large." }); return true; }
            using var buffer = new MemoryStream(); var chunk = new byte[8192]; int count;
            while ((count = await request.InputStream.ReadAsync(chunk)) > 0)
            { if (buffer.Length + count > MaxBytes) { await Reply(response, 413, new { error = "The world save is too large." }); return true; } await buffer.WriteAsync(chunk.AsMemory(0, count)); }
            using var json = JsonDocument.Parse(buffer.ToArray(), new JsonDocumentOptions { MaxDepth = 128 });
            var root = json.RootElement;
            if (root.ValueKind != JsonValueKind.Object || !root.TryGetProperty("expectedRevision", out var revision) || revision.ValueKind != JsonValueKind.Number || !revision.TryGetInt64(out var expected) || expected < 0 || !root.TryGetProperty("serverId", out var requestedServer) || requestedServer.ValueKind != JsonValueKind.String || requestedServer.GetString() != serverId || !root.TryGetProperty("entries", out var input) || input.ValueKind != JsonValueKind.Object)
            { await Reply(response, 400, new { error = "Invalid world save envelope." }); return true; }
            var entries = new Dictionary<string, string>();
            foreach (var item in input.EnumerateObject())
            {
                if (!Keys.Contains(item.Name) || item.Value.ValueKind != JsonValueKind.String) throw new JsonException("Unknown world record.");
                var raw = item.Value.GetString()!;
                using var parsed = JsonDocument.Parse(raw, new JsonDocumentOptions { MaxDepth = 128 });
                var kind = parsed.RootElement.ValueKind;
                if (item.Name == "miraverse-maid-counter-OR" ? kind != JsonValueKind.Number : item.Name.Contains("identit") ? kind != JsonValueKind.Array : kind != JsonValueKind.Object) throw new JsonException("Invalid world record shape.");
                if (!entries.TryAdd(item.Name, raw)) throw new JsonException("Duplicate world record.");
            }
            using var connection = Open();
            using var transaction = connection.BeginTransaction();
            var current = Read(connection, transaction);
            if (current.Revision != expected) { transaction.Rollback(); await Reply(response, 409, current); return true; }
            var updated = DateTimeOffset.UtcNow.ToString("O"); var serialized = JsonSerializer.Serialize(entries);
            using var write = connection.CreateCommand(); write.Transaction = transaction;
            write.CommandText = """
                INSERT INTO WorldSaves(Id, Revision, UpdatedAt, Entries) VALUES(1, $revision, $updated, $entries)
                ON CONFLICT(Id) DO UPDATE SET Revision=$revision, UpdatedAt=$updated, Entries=$entries;
                INSERT INTO WorldSaveHistory(Revision, UpdatedAt, Entries) VALUES($revision, $updated, $entries);
                DELETE FROM WorldSaveHistory WHERE Revision <= $revision - 20;
                """;
            write.Parameters.AddWithValue("$revision", expected + 1); write.Parameters.AddWithValue("$updated", updated); write.Parameters.AddWithValue("$entries", serialized);
            write.ExecuteNonQuery(); transaction.Commit();
            await Reply(response, 200, new WorldSnapshot(serverId, expected + 1, updated, entries));
        }
        catch (JsonException) { await Reply(response, 400, new { error = "Invalid world save data." }); }
        catch (SqliteException exception) when (exception.SqliteErrorCode == 5 || exception.SqliteErrorCode == 6) { await Reply(response, 503, new { error = "The world database is busy. Retry the save." }); }
        return true;
    }
    private static bool AllowedOrigin(string? origin, int port)
    {
        if (string.IsNullOrEmpty(origin)) return true;
        return Uri.TryCreate(origin, UriKind.Absolute, out var uri) && uri.Scheme == "http" && (uri.Host == "localhost" || uri.Host == "127.0.0.1" || uri.Host == "[::1]") && (uri.Port == port || uri.Port is >= 3000 and <= 3099);
    }
    internal static async Task Reply(HttpListenerResponse response, int status, object body)
    {
        var bytes = JsonSerializer.SerializeToUtf8Bytes(body, JsonOptions); response.StatusCode = status; response.ContentType = "application/json; charset=utf-8"; response.ContentLength64 = bytes.Length;
        await response.OutputStream.WriteAsync(bytes); response.Close();
    }
    private sealed record WorldSnapshot(string ServerId, long Revision, string? UpdatedAt, Dictionary<string, string> Entries);
}
