$ErrorActionPreference = 'Stop'
$projectRoot = $PSScriptRoot
$pluginRoot = Join-Path $projectRoot 'agenda-contactos'
$distRoot = Join-Path $projectRoot 'dist'
$pluginMain = Get-Content (Join-Path $pluginRoot 'agenda-contactos.php') -Raw
$versionMatch = [regex]::Match($pluginMain, 'Version:\s*([0-9]+\.[0-9]+\.[0-9]+)')
if (!$versionMatch.Success) { throw 'No se encontró la versión del plugin.' }
$version = $versionMatch.Groups[1].Value
New-Item -ItemType Directory -Path $distRoot -Force | Out-Null
$zipPath = Join-Path $distRoot "agenda-contactos-$version.zip"
Compress-Archive -LiteralPath $pluginRoot -DestinationPath $zipPath -Force
Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive = [IO.Compression.ZipFile]::OpenRead($zipPath)
try {
    $sourceFiles = @(Get-ChildItem -LiteralPath $pluginRoot -File -Recurse)
    $entries = @($archive.Entries | Where-Object { $_.Name })
    if ($entries.Count -ne $sourceFiles.Count) { throw 'El ZIP contiene un número inesperado de archivos.' }
    foreach ($file in $sourceFiles) {
        $relative = $file.FullName.Substring($projectRoot.Length + 1).Replace('\','/')
        $entry = $archive.Entries | Where-Object { $_.FullName.Replace('\','/') -eq $relative }
        if (!$entry) { throw "Falta $relative en el ZIP." }
        $stream = $entry.Open()
        $sha = [Security.Cryptography.SHA256]::Create()
        try { $zipHash = [BitConverter]::ToString($sha.ComputeHash($stream)).Replace('-','') }
        finally { $stream.Dispose(); $sha.Dispose() }
        if ($zipHash -ne (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash) { throw "No coincide $relative." }
    }
} finally { $archive.Dispose() }
$manifest = Get-ChildItem -LiteralPath $projectRoot -Recurse -File | Where-Object { $_.Name -ne 'SHA256SUMS.txt' } | Sort-Object FullName | ForEach-Object {
    $relative = $_.FullName.Substring($projectRoot.Length + 1).Replace('\','/')
    ((Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash.ToLower() + '  ' + $relative)
}
$manifest | Set-Content -LiteralPath (Join-Path $projectRoot 'SHA256SUMS.txt') -Encoding utf8
Write-Output "OK: ZIP verificado archivo por archivo: $zipPath"
