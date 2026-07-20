$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$EnvFile = Join-Path $Root "permanent-link.env"
$Ngrok = Join-Path $Root "tools\ngrok.exe"
$Cfg = Join-Path $Root "tools\ngrok.yml"

if (-not (Test-Path $Ngrok)) {
  Write-Host "ngrok ne nayden. Zapustite snachala setup." -ForegroundColor Red
  exit 1
}

if (-not (Test-Path $EnvFile)) {
  Write-Host "Net permanent-link.env" -ForegroundColor Red
  exit 1
}

$map = @{}
Get-Content $EnvFile | ForEach-Object {
  if ($_ -match '^\s*#' -or $_ -match '^\s*$') { return }
  $p = $_.Split('=', 2)
  if ($p.Count -eq 2) { $map[$p[0].Trim()] = $p[1].Trim() }
}

$token = $map['AUTHTOKEN']
$domain = $map['DOMAIN']

if ([string]::IsNullOrWhiteSpace($token) -or [string]::IsNullOrWhiteSpace($domain)) {
  Write-Host ""
  Write-Host " Nuzhen odin raz nastroit postoyannuyu ssylku:" -ForegroundColor Yellow
  Write-Host " 1) Zaregistriruytes (besplatno): https://dashboard.ngrok.com/signup"
  Write-Host " 2) Skopiruyte Authtoken:     https://dashboard.ngrok.com/get-started/your-authtoken"
  Write-Host " 3) Sozdayte domen:           https://dashboard.ngrok.com/domains"
  Write-Host "    (naprimer: ostrov-sudby.ngrok-free.app)"
  Write-Host " 4) Vstavte token i domen v fayl permanent-link.env"
  Write-Host " 5) Snova zapustite etot skript / start-permanent.bat"
  Write-Host ""
  Start-Process "https://dashboard.ngrok.com/signup"
  Start-Process "notepad.exe" $EnvFile
  exit 2
}

@"
version: "2"
authtoken: $token
tunnels:
  novosti:
    proto: http
    addr: 8090
    domain: $domain
"@ | Set-Content -Path $Cfg -Encoding ASCII

Write-Host ""
Write-Host " Postoyannaya ssylka: https://$domain" -ForegroundColor Green
Write-Host " Ostavte eto okno otkrytym (ili rabotaet cherez avtozapusk)."
Write-Host ""

& $Ngrok start novosti --config $Cfg
