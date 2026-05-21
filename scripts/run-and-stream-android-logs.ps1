param(
  [string]$PackageName = "io.ionic.starter",
  [string]$FilterRegex = "StorageStats|SafFileOps|Explorer|Capacitor|AndroidRuntime|chromium",
  [switch]$Clear,
  [switch]$ErrorsOnly,
  [string]$CapArgs = ""
)

$ErrorActionPreference = "Stop"

function Require-Command {
  param([string]$Name)
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Required command '$Name' was not found in PATH."
  }
}

Require-Command npx
Require-Command adb

$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

Write-Host "Starting Android app with Capacitor..." -ForegroundColor Cyan
$capCommand = "npx cap run android"
if (-not [string]::IsNullOrWhiteSpace($CapArgs)) {
  $capCommand = "$capCommand $CapArgs"
}

Write-Host "Running: $capCommand" -ForegroundColor DarkGray
Invoke-Expression $capCommand

if ($LASTEXITCODE -ne 0) {
  throw "Capacitor run failed with exit code $LASTEXITCODE"
}

$loggerScript = Join-Path $PSScriptRoot "stream-android-logs.ps1"
if (-not (Test-Path $loggerScript)) {
  throw "Logger script not found: $loggerScript"
}

Write-Host "App run completed. Starting filtered log stream..." -ForegroundColor Green

$loggerParams = @{
  PackageName = $PackageName
  FilterRegex = $FilterRegex
}

if ($Clear) { $loggerParams.Clear = $true }
if ($ErrorsOnly) { $loggerParams.ErrorsOnly = $true }

& $loggerScript @loggerParams
