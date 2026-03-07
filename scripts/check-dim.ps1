Add-Type -AssemblyName System.Drawing

$artifactDir = "C:\Users\papic\.gemini\antigravity\brain\50bd67e4-5ba4-4e45-905f-f9fec4eb9c9c"
$jpgFile = "$artifactDir\aeterna_play_header_4096x2304_compressed.jpg"
$pngFile = "$artifactDir\aeterna_play_header_4096x2304.png"

$img1 = [System.Drawing.Image]::FromFile($jpgFile)
Write-Host "JPG Width: $($img1.Width), Height: $($img1.Height)"
$img1.Dispose()

$img2 = [System.Drawing.Image]::FromFile($pngFile)
Write-Host "PNG Width: $($img2.Width), Height: $($img2.Height)"
$img2.Dispose()
