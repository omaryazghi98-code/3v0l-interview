$processes = Get-Process Discord -ErrorAction SilentlyContinue | Sort-Object StartTime
if (-not $processes) {
  Write-Host "Discord.exe not found. Start Discord first." -ForegroundColor Red
  exit 1
}

Write-Host "Discord processes:" -ForegroundColor Cyan
$processes | Select-Object Id, ProcessName, StartTime | Format-Table -AutoSize

$root = $processes | Sort-Object StartTime | Select-Object -First 1
Write-Host "Recommended root PID: $($root.Id)" -ForegroundColor Green
Write-Host "Use this PID with 3v0l-listener.exe so child Discord audio processes are included." -ForegroundColor Gray
