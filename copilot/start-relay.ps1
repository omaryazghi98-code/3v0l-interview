$ErrorActionPreference='Stop'
$here=Split-Path -Parent $MyInvocation.MyCommand.Path
$envFile=Join-Path $here '.env'
if(Test-Path $envFile){Get-Content $envFile | Where-Object {$_ -and $_ -notmatch '^\s*#' -and $_ -match '='} | ForEach-Object {$k,$v=$_.Split('=',2);[Environment]::SetEnvironmentVariable($k.Trim(),$v.Trim())}}
Write-Host 'Starting 3V0L Copilot relay on port 38471'
Write-Host 'The relay listens on the LAN so the iPhone remote can connect.'
node (Join-Path $here 'server.mjs')