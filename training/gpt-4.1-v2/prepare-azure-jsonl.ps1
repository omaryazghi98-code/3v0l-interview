# Prepare GPT-4.1 v2 JSONL files for Azure Microsoft Foundry fine-tuning.
# Windows PowerShell 5.1+: rewrites the files as UTF-8 with BOM.

$ErrorActionPreference = 'Stop'
$dir = Split-Path -Parent $MyInvocation.MyCommand.Path

foreach ($name in @('train.jsonl','validation.jsonl')) {
    $path = Join-Path $dir $name
    if (!(Test-Path $path)) { throw "Missing file: $path" }
    $text = [System.IO.File]::ReadAllText($path)
    [System.IO.File]::WriteAllText($path, $text, (New-Object System.Text.UTF8Encoding($true)))
    Write-Host "Prepared UTF-8 BOM: $name"
}

Write-Host "Done. Upload train.jsonl and validation.jsonl with purpose=fine-tune."