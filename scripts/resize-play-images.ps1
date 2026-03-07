Add-Type -AssemblyName System.Drawing

$artifactDir = "C:\Users\papic\.gemini\antigravity\brain\50bd67e4-5ba4-4e45-905f-f9fec4eb9c9c"
$iconIn = "$artifactDir\qantum_dev_icon_1772328273062.png"
$iconOut = "$artifactDir\aeterna_app_icon_512x512.png"

$headerIn = "$artifactDir\aeterna_play_header_1772328290803.png"
$headerOut = "$artifactDir\aeterna_play_header_4096x2304.png"

# Resize Icon to Exact 512x512
$img = [System.Drawing.Image]::FromFile($iconIn)
$bmp = New-Object System.Drawing.Bitmap(512, 512)
$graph = [System.Drawing.Graphics]::FromImage($bmp)
$graph.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graph.DrawImage($img, 0, 0, 512, 512)
$bmp.Save($iconOut, [System.Drawing.Imaging.ImageFormat]::Png)
$img.Dispose()
$bmp.Dispose()
$graph.Dispose()
Write-Host "✅ App Icon resized to exactly 512x512 pixels"

# Resize Header to Exact 4096x2304
$img2 = [System.Drawing.Image]::FromFile($headerIn)
$bmp2 = New-Object System.Drawing.Bitmap(4096, 2304)
$graph2 = [System.Drawing.Graphics]::FromImage($bmp2)
$graph2.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graph2.DrawImage($img2, 0, 0, 4096, 2304)
$bmp2.Save($headerOut, [System.Drawing.Imaging.ImageFormat]::Png)
$img2.Dispose()
$bmp2.Dispose()
$graph2.Dispose()
Write-Host "✅ Header Image resized to exactly 4096x2304 pixels"
