$ErrorActionPreference = "Continue"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Node = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $Node) {
  Write-Host "Node.js ne nayden. Ustanovite s https://nodejs.org" -ForegroundColor Red
  exit 1
}

$TaskName = "OstrovSudbyNovosti"
$Bat = Join-Path $Root "start-hidden.vbs"

@'
Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
WshShell.Run "cmd /c node server.js >> server.log 2>&1", 0, False
'@ | Set-Content -Path $Bat -Encoding ASCII

# Remove old task if exists (ignore if missing)
cmd /c "schtasks /Delete /TN $TaskName /F >nul 2>&1"

# Create logon task
$Action = "wscript.exe `"$Bat`""
cmd /c "schtasks /Create /TN $TaskName /TR `"$Action`" /SC ONLOGON /RL LIMITED /F"

# Firewall allow inbound 8080
cmd /c "netsh advfirewall firewall delete rule name=`"Ostrov Sudby Novosti 8090`" >nul 2>&1"
cmd /c "netsh advfirewall firewall add rule name=`"Ostrov Sudby Novosti 8090`" dir=in action=allow protocol=TCP localport=8090"

# Also add to user Startup folder (no admin needed)
$startup = [Environment]::GetFolderPath('Startup')
$lnkPath = Join-Path $startup "OstrovSudbyNovosti.lnk"
$w = New-Object -ComObject WScript.Shell
$lnk = $w.CreateShortcut($lnkPath)
$lnk.TargetPath = $Bat
$lnk.WorkingDirectory = $Root
$lnk.Description = "Ostrov Sudby Novosti web server"
$lnk.Save()

Write-Host ""
Write-Host " Avtozapusk ustanovlen." -ForegroundColor Green
Write-Host " Avtozagruzka Windows: $lnkPath"
Write-Host " (Zadacha Planіrovschika — esli byl dostup admina)"
Write-Host ""
Write-Host " Lokalno:  http://localhost:8090"
Write-Host " V seti:   http://192.168.100.3:8090  (proverte IP)"
Write-Host ""
Write-Host " Iz interneta: start.bat, zatem start-tunnel.bat"
Write-Host ""
