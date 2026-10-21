#requires -Version 7.0
$ErrorActionPreference = 'Stop'
$workspaceRoot = Split-Path -Parent $PSScriptRoot
$assembly = Join-Path $workspaceRoot 'bin/Release/net8.0/MiraverseOSx.dll'
if (-not (Test-Path -LiteralPath $assembly)) { throw 'Build the Release backend before running this test.' }
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
    Invoke-WebRequest -Uri "$baseUrl/api/world" -Method Put -ContentType 'application/json' -Body ($envelope | ConvertTo-Json -Depth 100 -Compress) -Headers $headers -SkipHttpErrorCheck
}
try {
    Start-TestServer
    $empty = Invoke-RestMethod -Uri "$baseUrl/api/world"
    Check ($empty.revision -eq 0) 'A new database must start empty.'
    $entries = @{ 'miraverse-os-progress' = '{"state":{"gameplay":{"player":{"name":"Backend tester","credits":100}}},"version":1}'; 'miraverse-comms' = '{"state":{"emails":[{"id":"dispatch"}],"savedAttachmentIds":["one"]}}' }
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
    $badRevision = Send-World @{ serverId = $empty.serverId; expectedRevision = 'not-a-number'; entries = @{} }
    Check ($badRevision.StatusCode -eq 400) 'Malformed envelopes must return JSON validation errors.'
    $foreign = Send-World @{ serverId = $empty.serverId; expectedRevision = 1; entries = $entries } 'https://unrelated.example'
    Check ($foreign.StatusCode -eq 403) 'Unrelated origins cannot write the local world.'
    $missing = Invoke-WebRequest -Uri "$baseUrl/api/missing" -SkipHttpErrorCheck
    Check ($missing.StatusCode -eq 404 -and $missing.Headers.'Content-Type' -match 'application/json') 'Unknown APIs must not return the HTML application.'
    $afterInvalid = Invoke-RestMethod -Uri "$baseUrl/api/world"
    Check ($afterInvalid.revision -eq 1 -and $afterInvalid.entries.'miraverse-os-progress' -eq $entries.'miraverse-os-progress') 'Rejected writes modified the saved world.'
    Stop-Process -Id $server.Id; $server.WaitForExit(); $server = $null
    Start-TestServer
    $restored = Invoke-RestMethod -Uri "$baseUrl/api/world"
    Check ($restored.serverId -eq $empty.serverId -and $restored.revision -eq 1) 'Database identity and revision did not survive restart.'
    Check ($restored.entries.'miraverse-comms' -eq $entries.'miraverse-comms') 'Mail did not survive restart.'
    Write-Output "Backend integration checks passed: $checks"
}
finally {
    if ($server -and -not $server.HasExited) { Stop-Process -Id $server.Id; $server.WaitForExit() }
    $resolvedTarget = (Resolve-Path -LiteralPath $testDirectory).Path
    if ([IO.Path]::GetDirectoryName($resolvedTarget).TrimEnd('\') -ne $temporaryRoot.TrimEnd('\') -or -not [IO.Path]::GetFileName($resolvedTarget).StartsWith('miraverse-world-tests-')) { throw 'Refusing to remove an unexpected test directory.' }
    Remove-Item -LiteralPath $resolvedTarget -Recurse -Force
}
