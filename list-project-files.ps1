$outputFile = "folder-structure.txt"
"MiraverseOSx src Directory Tree" | Out-File -FilePath $outputFile -Encoding utf8
"================================" | Out-File -FilePath $outputFile -Append -Encoding utf8

function Export-Tree($Path, $Indent = "") {
    Get-ChildItem -Path $Path | Sort-Object PSIsContainer -Descending | ForEach-Object {
        $line = "$Indent$($_.Name)"
        $line | Out-File -FilePath $outputFile -Append -Encoding utf8
        if ($_.PSIsContainer) {
            Export-Tree $_.FullName "$Indent  "
        }
    }
}

# Change this line at the bottom of your script:
Export-Tree -Path "miraverse-frontend\src"
Write-Host "Success! Clean directory tree saved to $outputFile" -ForegroundColor Green