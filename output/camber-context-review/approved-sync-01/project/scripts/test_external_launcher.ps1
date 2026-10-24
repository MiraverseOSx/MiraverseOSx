$ErrorActionPreference = 'Stop'
$repoPath = Split-Path -Parent $PSScriptRoot
$tempRoot = [IO.Path]::GetFullPath([IO.Path]::GetTempPath())
$runnerPath = Join-Path $tempRoot ('miraverse-launcher-test-' + [Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $runnerPath | Out-Null
try {
    $projectPath = [Security.SecurityElement]::Escape((Join-Path $repoPath 'MiraverseOSx.csproj'))
    @"
<Project Sdk="Microsoft.NET.Sdk"><PropertyGroup><OutputType>Exe</OutputType><TargetFramework>net8.0</TargetFramework><ImplicitUsings>enable</ImplicitUsings></PropertyGroup><ItemGroup><ProjectReference Include="$projectPath" /></ItemGroup></Project>
"@ | Set-Content -LiteralPath (Join-Path $runnerPath 'LauncherTest.csproj')
    @'
using System.Reflection;
var type = Assembly.Load("MiraverseOSx").GetType("MiraverseOSx.Program")!;
var method = type.GetMethod("TryExternalLaunchTarget", BindingFlags.Static | BindingFlags.NonPublic)!;
var checks = 0;
void Check(string value, bool expected) {
    object[] args = { value, "" };
    var actual = (bool)method.Invoke(null, args)!;
    if (actual != expected) throw new Exception($"Unexpected launch validation for {value}: {actual}");
    checks++;
}
Check("https://example.com/tool?q=hello", true);
Check("http://localhost:8080/index.html", true);
foreach (var value in new[] { "javascript:alert(1)", "data:text/html,test", "ftp://example.com", "https://user:pass@example.com", "https://dga.gov", "https://cyacademy.edu", "https://records.orynvell.gov", "https://mai.space", "https://faithmed.aure", "https://civinet.mer", "https://test.onion", "file://server/share/test.html", "file:///C:/Windows/System32/cmd.exe", "file:///C:/does-not-exist.html", "not a url" }) Check(value, false);
var file = Path.Combine(Path.GetTempPath(), $"miraverse-launch-test-{Guid.NewGuid():N}.html");
File.WriteAllText(file, "<!doctype html><title>Launcher validation fixture</title>");
try { Check(new Uri(file).AbsoluteUri, true); Check(new Uri(file).AbsoluteUri + "?execute=1", false); }
finally { File.Delete(file); }
Console.WriteLine($"PASS: {checks} native destination validation checks; no websites or files were launched.");
'@ | Set-Content -LiteralPath (Join-Path $runnerPath 'Program.cs')
    dotnet run --project (Join-Path $runnerPath 'LauncherTest.csproj') --verbosity quiet
    if ($LASTEXITCODE -ne 0) { throw 'Native launcher validation failed.' }
} finally {
    $resolvedRunner = [IO.Path]::GetFullPath($runnerPath)
    if (!$resolvedRunner.StartsWith($tempRoot, [StringComparison]::OrdinalIgnoreCase) -or !(Split-Path -Leaf $resolvedRunner).StartsWith('miraverse-launcher-test-')) { throw 'Refusing to clean an unexpected temporary path.' }
    Remove-Item -LiteralPath $resolvedRunner -Recurse -Force
}
