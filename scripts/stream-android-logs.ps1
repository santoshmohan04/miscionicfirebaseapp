param(
  [string]$PackageName = "io.ionic.starter",
  [string]$FilterRegex = "StorageStats|SafFileOps|Explorer|Capacitor|AndroidRuntime|chromium",
  [switch]$Clear,
  [switch]$ErrorsOnly
)

$ErrorActionPreference = "Stop"

function Require-Command {
  param([string]$Name)
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Required command '$Name' was not found in PATH."
  }
}

Require-Command adb

Write-Host "Checking connected devices..." -ForegroundColor Cyan
$devices = adb devices | Select-String "\tdevice$"
if (-not $devices) {
  throw "No Android device detected. Connect a device and enable USB debugging."
}

if ($Clear) {
  Write-Host "Clearing existing logcat buffer..." -ForegroundColor Yellow
  adb logcat -c | Out-Null
}

Write-Host "Resolving PID for package: $PackageName" -ForegroundColor Cyan
$appPid = (adb shell pidof -s $PackageName 2>$null).Trim()

if ([string]::IsNullOrWhiteSpace($appPid)) {
  Write-Host "PID not found. App may not be running yet." -ForegroundColor Yellow
  Write-Host "Tip: start app first: npx cap run android" -ForegroundColor DarkYellow
  Write-Host "Falling back to all-process stream with regex filter..." -ForegroundColor Yellow

  if ($ErrorsOnly) {
    adb logcat "*:E" | Select-String -Pattern $FilterRegex
  } else {
    adb logcat | Select-String -Pattern $FilterRegex
  }
  exit 0
}

Write-Host "Using PID: $appPid" -ForegroundColor Green
Write-Host "Filter: $FilterRegex" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop." -ForegroundColor DarkGray

if ($ErrorsOnly) {
  adb logcat --pid=$appPid "*:E" | Select-String -Pattern $FilterRegex
} else {
  adb logcat --pid=$appPid | Select-String -Pattern $FilterRegex
}
