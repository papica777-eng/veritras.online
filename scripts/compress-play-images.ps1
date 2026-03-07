Add-Type -AssemblyName System.Drawing

$artifactDir = "C:\Users\papic\.gemini\antigravity\brain\50bd67e4-5ba4-4e45-905f-f9fec4eb9c9c"
$inFile = "$artifactDir\aeterna_play_header_4096x2304.png"
$outFile = "$artifactDir\aeterna_play_header_4096x2304_compressed.jpg"

Write-Host "Compressing header image to JPEG..."

$bmp = [System.Drawing.Bitmap]::FromFile($inFile)

$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$qualityParam = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]80) # 80% quality is usually enough to drop under 1MB
$encoderParams.Param[0] = $qualityParam

$bmp.Save($outFile, $jpegCodec, $encoderParams)
$bmp.Dispose()

$fileInfo = Get-Item $outFile
$mbSize = [math]::Round($fileInfo.Length / 1MB, 2)
Write-Host "✅ Compression complete. New file size: $mbSize MB"
