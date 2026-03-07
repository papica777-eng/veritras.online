$serverTime = (Invoke-RestMethod -Uri "https://api.binance.com/api/v3/time").serverTime
$queryString = "timestamp=$serverTime"
$hmacsha = New-Object System.Security.Cryptography.HMACSHA256
$hmacsha.Key = [Text.Encoding]::ASCII.GetBytes("tbo8EpcCTBWhW3KWxRuSTVAhDMIdEMv0MNUuSG1vCqokSu0weWo5skQ2kjC76IxA")
$signatureBytes = $hmacsha.ComputeHash([Text.Encoding]::ASCII.GetBytes($queryString))
$sig = [BitConverter]::ToString($signatureBytes).Replace("-", "").ToLower()

$json = curl.exe -s -H "X-MBX-APIKEY: JKo2w3qHc0eskBwv7V7ZE7OFUoRt2Y3r8WKPNlcLXc6QAJ4ToghODN07ik9Ja7JL" "https://api.binance.com/api/v3/account?timestamp=$serverTime&signature=$sig"
$res = $json | ConvertFrom-Json
$res.balances | Where-Object { [float]$_.free -gt 0 -or [float]$_.locked -gt 0 } | ForEach-Object {
    Write-Host "$($_.asset): $($_.free)"
}
