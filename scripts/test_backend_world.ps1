param([string]$AssemblyPath = '')
$ErrorActionPreference = 'Stop'
$workspaceRoot = Split-Path -Parent $PSScriptRoot
$assembly = if ($AssemblyPath) { [IO.Path]::GetFullPath($AssemblyPath) } else { Join-Path $workspaceRoot 'bin/Release/net8.0/MiraverseOSx.dll' }
if (-not (Test-Path -LiteralPath $assembly)) {
    $assembly = Join-Path $workspaceRoot 'bin/Debug/net8.0/MiraverseOSx.dll'
}
if (-not (Test-Path -LiteralPath $assembly)) { throw 'Build the backend before running this test.' }
$temporaryRoot = [IO.Path]::GetFullPath([IO.Path]::GetTempPath())
$testDirectory = [IO.Path]::GetFullPath((Join-Path $temporaryRoot ('miraverse-world-tests-' + [Guid]::NewGuid().ToString('N'))))
if (-not $testDirectory.StartsWith($temporaryRoot, [StringComparison]::OrdinalIgnoreCase)) { throw 'Invalid test directory.' }
New-Item -ItemType Directory -Path $testDirectory | Out-Null
$listener = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback, 0)
$listener.Start(); $port = $listener.LocalEndpoint.Port; $listener.Stop()
$baseUrl = "http://localhost:$port"
$dotnet = (Get-Command dotnet).Source
$server = $null; $checks = 0
function Start-TestServer {
    $script:server = Start-Process -FilePath $dotnet -ArgumentList @(('"' + $assembly + '"'), '--server-only', '--port', "$port", '--data-dir', ('"' + $testDirectory + '"')) -WindowStyle Hidden -PassThru -WorkingDirectory $workspaceRoot -RedirectStandardOutput (Join-Path $testDirectory 'server.log') -RedirectStandardError (Join-Path $testDirectory 'server-error.log')
    for ($attempt = 0; $attempt -lt 60; $attempt++) {
        try { $health = Invoke-RestMethod -Uri "$baseUrl/api/health" -TimeoutSec 1; if ($health.service -eq 'miraverse-world') { return } } catch { }
        if ($script:server.HasExited) { throw (Get-Content -LiteralPath (Join-Path $testDirectory 'server-error.log') -Raw) }
        Start-Sleep -Milliseconds 100
    }
    throw 'Backend did not start.'
}
function Check($condition, $message) { if (-not $condition) { throw $message }; $script:checks++ }
function Send-World($envelope, $origin = $null) {
    $headers = @{}; if ($origin) { $headers.Origin = $origin }
    $body = ($envelope | ConvertTo-Json -Depth 100 -Compress)
    $uri = "$baseUrl/api/world"
    if ($PSVersionTable.PSVersion.Major -ge 7) {
        return Invoke-WebRequest -Uri $uri -Method Put -ContentType 'application/json' -Body $body -Headers $headers -SkipHttpErrorCheck
    }
    try {
        return Invoke-WebRequest -Uri $uri -Method Put -ContentType 'application/json' -Body $body -Headers $headers -UseBasicParsing
    } catch [System.Net.WebException] {
        $resp = $_.Exception.Response
        if ($resp) {
            $stream = $resp.GetResponseStream()
            $reader = [System.IO.StreamReader]::new($stream)
            $content = $reader.ReadToEnd()
            $reader.Close()
            return [PSCustomObject]@{
                StatusCode = [int]$resp.StatusCode
                Content = $content
                Headers = @{ 'Content-Type' = $resp.ContentType }
            }
        }
        throw
    }
}
try {
    Start-TestServer
    $empty = Invoke-RestMethod -Uri "$baseUrl/api/world"
    Check ($empty.revision -eq 0) 'A new database must start empty.'
    $entries = @{ 'miraverse-os-progress' = '{"state":{"gameplay":{"player":{"name":"Backend tester","credits":100}}},"version":1}'; 'miraverse-comms' = '{"state":{"emails":[{"id":"dispatch"}],"savedAttachmentIds":["one"]}}'; 'miraverse-creator-studio-state-v1' = '{"worldState":{"cases":[]},"publishedEntries":[]}' }
    $entries['trace_records_v2'] = '[{"id":"EV-test","caseId":"custom-case"}]'
    $entries['DGAOS_WORKSTATION_STATE_V3'] = '{"cases":[],"operations":{"response":{"units":[{"id":"UNIT-1","callsign":"PATROL-1","onDuty":true}],"assignments":[{"id":"ASSIGN-1","incidentId":"INCIDENT-1","status":"on scene"}],"transmissions":[{"id":"RADIO-1","text":"Acknowledged"}],"conversations":[{"id":"CHAT-1","turns":[{"reply":"Saw a badge"}]}],"scenarios":[{"id":"SCENE-1","hiddenFacts":["Keep separate"]}]}}}'
    $entries['trace_drafts_v2'] = '{"EX-test":{"caseId":"custom-case","data":{"notes":"unfinished"}}}'
    $entries['trace_transmissions_v2'] = '{"report":{"dgaCaseId":"custom-case","status":"Transmitted"}}'
    $entries['trace_open_lab_notes'] = 'Plain text notes that must survive restore.'
    $entries['trace_exam_draft_EX-test'] = '{"draft":{"notes":"unsubmitted"}}'
    $entries['miraverse-issued-document-snapshots-v1'] = '[{"id":"issued-1"}]'
    $saved = Send-World @{ serverId = $empty.serverId; expectedRevision = 0; entries = $entries }
    Check ($saved.StatusCode -eq 200) 'Initial world import failed.'
    $world = $saved.Content | ConvertFrom-Json
    Check ($world.revision -eq 1 -and $world.entries.'miraverse-comms' -eq $entries.'miraverse-comms') 'The cross-app snapshot was not committed together.'
    $stale = Send-World @{ serverId = $empty.serverId; expectedRevision = 0; entries = @{} }
    Check ($stale.StatusCode -eq 409) 'Stale writes must conflict.'
    $bad = Send-World @{ serverId = $empty.serverId; expectedRevision = 1; entries = @{ '.env' = '{}' } }
    Check ($bad.StatusCode -eq 400) 'Unknown records must be rejected.'
    $badShape = Send-World @{ serverId = $empty.serverId; expectedRevision = 1; entries = @{ 'miraverse-comms' = '[]' } }
    Check ($badShape.StatusCode -eq 400) 'Invalid record shapes must be rejected.'
    $badTraceShape = Send-World @{ serverId = $empty.serverId; expectedRevision = 1; entries = @{ 'trace_records_v2' = '{}' } }
    Check ($badTraceShape.StatusCode -eq 400) 'TRACE records must be arrays.'
    $badPrefix = Send-World @{ serverId = $empty.serverId; expectedRevision = 1; entries = @{ 'trace_exam_draft_' = '{}' } }
    Check ($badPrefix.StatusCode -eq 400) 'Unscoped dynamic draft keys must be rejected.'
    $badRevision = Send-World @{ serverId = $empty.serverId; expectedRevision = 'not-a-number'; entries = @{} }
    Check ($badRevision.StatusCode -eq 400) 'Malformed envelopes must return JSON validation errors.'
    $foreign = Send-World @{ serverId = $empty.serverId; expectedRevision = 1; entries = $entries } 'https://unrelated.example'
    Check ($foreign.StatusCode -eq 403) 'Unrelated origins cannot write the local world.'
    if ($PSVersionTable.PSVersion.Major -ge 7) {
        $missing = Invoke-WebRequest -Uri "$baseUrl/api/missing" -SkipHttpErrorCheck
    } else {
        try {
            $missing = Invoke-WebRequest -Uri "$baseUrl/api/missing" -UseBasicParsing
        } catch [System.Net.WebException] {
            $resp = $_.Exception.Response
            $missing = [PSCustomObject]@{
                StatusCode = [int]$resp.StatusCode
                Headers = @{ 'Content-Type' = $resp.ContentType }
            }
        }
    }
    Check ($missing.StatusCode -eq 404 -and $missing.Headers.'Content-Type' -match 'application/json') 'Unknown APIs must not return the HTML application.'
    $afterInvalid = Invoke-RestMethod -Uri "$baseUrl/api/world"
    Check ($afterInvalid.revision -eq 1 -and $afterInvalid.entries.'miraverse-os-progress' -eq $entries.'miraverse-os-progress') 'Rejected writes modified the saved world.'
    Stop-Process -Id $server.Id; $server.WaitForExit(); $server = $null
    Start-TestServer
    $restored = Invoke-RestMethod -Uri "$baseUrl/api/world"
    Check ($restored.serverId -eq $empty.serverId -and $restored.revision -eq 1) 'Database identity and revision did not survive restart.'
    Check ($restored.entries.'miraverse-comms' -eq $entries.'miraverse-comms') 'Mail did not survive restart.'
    Check ($restored.entries.'miraverse-creator-studio-state-v1' -eq $entries.'miraverse-creator-studio-state-v1') 'Creator journal did not survive restart.'
    foreach ($key in @('DGAOS_WORKSTATION_STATE_V3','trace_records_v2','trace_drafts_v2','trace_transmissions_v2','trace_open_lab_notes','trace_exam_draft_EX-test','miraverse-issued-document-snapshots-v1')) {
        Check ($restored.entries.$key -eq $entries[$key]) "Saved investigation store did not survive restart: $key"
    }
    Write-Output "Backend integration checks passed: $checks"
}
finally {
    if ($server -and -not $server.HasExited) { Stop-Process -Id $server.Id; $server.WaitForExit() }
    $resolvedTarget = (Resolve-Path -LiteralPath $testDirectory).Path
    if ([IO.Path]::GetDirectoryName($resolvedTarget).TrimEnd('\') -ne $temporaryRoot.TrimEnd('\') -or -not [IO.Path]::GetFileName($resolvedTarget).StartsWith('miraverse-world-tests-')) { throw 'Refusing to remove an unexpected test directory.' }
    Remove-Item -LiteralPath $resolvedTarget -Recurse -Force
}
