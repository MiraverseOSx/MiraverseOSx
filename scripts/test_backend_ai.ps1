param([string]$AssemblyPath = '')
$ErrorActionPreference = 'Stop'
$workspaceRoot = Split-Path -Parent $PSScriptRoot
$assembly = if ($AssemblyPath) { [IO.Path]::GetFullPath($AssemblyPath) } else { Join-Path $workspaceRoot 'bin/Debug/net8.0/MiraverseOSx.dll' }
if (-not (Test-Path -LiteralPath $assembly)) {
    $assembly = Join-Path $workspaceRoot 'bin/Release/net8.0/MiraverseOSx.dll'
}
if (-not (Test-Path -LiteralPath $assembly)) { throw 'Build the backend before running this test.' }

$temporaryRoot = [IO.Path]::GetFullPath([IO.Path]::GetTempPath())
$testDirectory = [IO.Path]::GetFullPath((Join-Path $temporaryRoot ('miraverse-ai-tests-' + [Guid]::NewGuid().ToString('N'))))
New-Item -ItemType Directory -Path $testDirectory | Out-Null

$listener = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback, 0)
$listener.Start(); $port = $listener.LocalEndpoint.Port; $listener.Stop()
$baseUrl = "http://localhost:$port"
$dotnet = (Get-Command dotnet).Source
$server = $null
$checks = 0

function Start-TestServer {
    $script:server = Start-Process -FilePath $dotnet -ArgumentList @(('"' + $assembly + '"'), '--server-only', '--port', "$port", '--data-dir', ('"' + $testDirectory + '"')) -WindowStyle Hidden -PassThru -WorkingDirectory $workspaceRoot -RedirectStandardOutput (Join-Path $testDirectory 'server.log') -RedirectStandardError (Join-Path $testDirectory 'server-error.log')
    for ($attempt = 0; $attempt -lt 60; $attempt++) {
        try {
            $health = Invoke-RestMethod -Uri "$baseUrl/api/health" -TimeoutSec 1
            if ($health.service -eq 'miraverse-world') { return }
        } catch { }
        if ($script:server.HasExited) { throw (Get-Content -LiteralPath (Join-Path $testDirectory 'server-error.log') -Raw) }
        Start-Sleep -Milliseconds 100
    }
    throw 'Backend did not start.'
}

function Check($condition, $message) {
    if (-not $condition) { throw $message }
    $script:checks++
}

function Post-Json($path, $data) {
    $body = ($data | ConvertTo-Json -Depth 10 -Compress)
    $uri = "$baseUrl/$path"
    return Invoke-RestMethod -Uri $uri -Method Post -ContentType 'application/json' -Body $body
}

function Get-Json($path) {
    $uri = "$baseUrl/$path"
    return Invoke-RestMethod -Uri $uri -Method Get
}

try {
    Start-TestServer

    # 1. Check AI Telemetry endpoint
    $telemetry = Get-Json 'api/ai/telemetry'
    Check ($telemetry.dailyBudgetUsd -gt 0) 'Telemetry exposes positive daily budget'
    Check ($telemetry.budgetRemainingUsd -ge 0) 'Telemetry exposes valid budget remaining'
    Check ($telemetry.activeProvider -ne '') 'Telemetry exposes active provider name'

    # 2. Check NPC Memories seeded in SQLite
    $maiMemories = Get-Json 'api/ai/memories?npc=mai'
    Check ($maiMemories.npc -eq 'mai') 'Memory query returns requested NPC'
    Check ($maiMemories.memories.Count -ge 2) 'SQLite seeds default memories for Mai'

    # 3. Add custom memory to NPC in SQLite
    $addResult = Post-Json 'api/ai/memory' @{
        npc = 'mai'
        content = 'Player completed Section 9 containment operation in Tunnel 09'
        type = 'episodic'
        importance = 3.5
    }
    Check ($addResult.success -eq $true) 'Custom memory committed successfully'

    # 4. Verify custom memory retrieval
    $updatedMemories = Get-Json 'api/ai/memories?npc=mai'
    $hasNew = $false
    foreach ($m in $updatedMemories.memories) {
        if ($m.content -like '*Tunnel 09*') { $hasNew = $true; break }
    }
    Check $hasNew 'Retrieved memories include newly added episodic memory'

    # 5. Test AI Chat endpoint with Mai
    $chatRes1 = Post-Json 'api/ai/chat' @{
        npc = 'Mai'
        prompt = 'What is the current desktop resonance level?'
        activeApp = 'desktop'
    }
    Check ($chatRes1.npc -eq 'Mai') 'Chat response returns correct NPC'
    Check ($chatRes1.text.Length -gt 0) 'Chat response contains non-empty text'
    Check ($chatRes1.provider -ne '') 'Chat response identifies provider'
    Check ($chatRes1.cached -eq $false) 'First call is not cached'

    # 6. Test In-Memory Semantic Response Cache (identical query)
    $chatRes2 = Post-Json 'api/ai/chat' @{
        npc = 'Mai'
        prompt = 'What is the current desktop resonance level?'
        activeApp = 'desktop'
    }
    Check ($chatRes2.cached -eq $true) 'Second identical call hits response cache'
    Check ($chatRes2.text -eq $chatRes1.text) 'Cached text matches original response'
    Check ($chatRes2.estimatedCostUsd -eq 0) 'Cached call has zero cost'

    # 7. Test Persona Dialogue for Jeremie
    $jeremieChat = Post-Json 'api/ai/chat' @{
        npc = 'Jeremie'
        prompt = 'Can you inspect the terminal code for bugs?'
        activeApp = 'terminal'
    }
    Check ($jeremieChat.npc -eq 'Jeremie') 'Chat routes to Jeremie'
    Check ($jeremieChat.text.Length -gt 0) 'Jeremie generates valid dialogue'

    # 8. Test Persona Dialogue for Aelita
    $aelitaChat = Post-Json 'api/ai/chat' @{
        npc = 'Aelita'
        prompt = 'The garden fountain sounds very peaceful today.'
        activeApp = 'maispace'
    }
    Check ($aelitaChat.npc -eq 'Aelita') 'Chat routes to Aelita'
    Check ($aelitaChat.text.Length -gt 0) 'Aelita generates valid dialogue'

    # 9. Test Persona Dialogue for Sissi
    $sissiChat = Post-Json 'api/ai/chat' @{
        npc = 'Sissi'
        prompt = 'Are we going to the weekend event?'
        activeApp = 'maispace'
    }
    Check ($sissiChat.npc -eq 'Sissi') 'Chat routes to Sissi'
    Check ($sissiChat.text.Length -gt 0) 'Sissi generates valid dialogue'

    # 10. Verify Telemetry Request Counter Updated
    $finalTelemetry = Get-Json 'api/ai/telemetry'
    Check ($finalTelemetry.cacheHitsToday -ge 1) 'Telemetry recorded cache hit'

    Post-Json 'api/ai/memory' @{ npc = 'OpsWitness'; content = 'Unrelated old scenario secret'; type = 'episodic'; importance = 5.0 } | Out-Null
    $scoped = @{ npc = 'OpsWitness'; prompt = 'What do you know?'; activeApp = 'dga-operations'; contextScope = 'CASE-A:person-one'; context = '{"facts":[{"id":"one","text":"Saw a badge"}]}' }
    $firstScoped = Post-Json 'api/ai/chat' $scoped
    Check ($firstScoped.memoriesUsed.Count -eq 0) 'Case dialogue must not load global persona memories'
    $sameScoped = Post-Json 'api/ai/chat' $scoped
    Check ($sameScoped.cached -eq $true) 'Unchanged scoped facts may use the response cache'
    $scoped.contextScope = 'CASE-B:person-one'
    $otherScoped = Post-Json 'api/ai/chat' $scoped
    Check ($otherScoped.cached -eq $false) 'Another case cannot reuse the first case response'
    $scoped.context = '{"facts":[{"id":"two","text":"Saw a vehicle"}]}'
    $changedScoped = Post-Json 'api/ai/chat' $scoped
    Check ($changedScoped.cached -eq $false) 'Changed knowledge cannot reuse stale response cache'
    Write-Host "AI Subsystem integration checks passed: $script:checks"
}
finally {
    if ($script:server -and -not $script:server.HasExited) {
        Stop-Process -Id $script:server.Id -Force
    }
    if (Test-Path -LiteralPath $testDirectory) {
        $resolvedTestTarget = (Resolve-Path -LiteralPath $testDirectory).Path
        if ([IO.Path]::GetDirectoryName($resolvedTestTarget).TrimEnd('\') -ne $temporaryRoot.TrimEnd('\') -or -not [IO.Path]::GetFileName($resolvedTestTarget).StartsWith('miraverse-ai-tests-')) { throw 'Refusing to remove an unexpected test directory.' }
        Remove-Item -LiteralPath $resolvedTestTarget -Recurse -Force -ErrorAction SilentlyContinue
    }
}
