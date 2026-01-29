# Fix EPERM on .next\trace when path has spaces or dev server locked the file.
# Run: .\scripts\build-win.ps1   or   npm run build:win
# If this still fails, stop the dev server and run "npm run build" from an external terminal.
$ErrorActionPreference = "Stop"
$root = $PSScriptRoot + "\.."
$absPath = (Resolve-Path $root).Path

# Use a subst drive (no spaces) to avoid Windows EPERM on trace file
$drive = "Z:"
$exitCode = 0
try {
  subst $drive $absPath 2>$null
  Set-Location $drive
  & npx next build
  $exitCode = $LASTEXITCODE
} finally {
  Set-Location $absPath
  subst $drive /d 2>$null
}
exit $exitCode
