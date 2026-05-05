# ==============================================
# SARA - Smart Academic Read-Only Assistant
# Windows Setup Script (PowerShell)
# ==============================================
param(
    [switch]$SkipInstall,
    [switch]$SeedOnly
)
$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
function Write-Step { param([string]$Message); Write-Host ""; Write-Host "=== $Message ===" -ForegroundColor Cyan }
function Write-Success { param([string]$Message); Write-Host "[OK] $Message" -ForegroundColor Green }
function Write-Warn { param([string]$Message); Write-Host "[!] $Message" -ForegroundColor Yellow }
function Write-Fail { param([string]$Message); Write-Host "[X] $Message" -ForegroundColor Red }
Write-Step "Checking prerequisites"
try { $nodeVersion = node --version; Write-Success "Node.js found: $nodeVersion"; $nodeMajor = [int]($nodeVersion -replace 'v(\d+)\..*', '$1'); if ($nodeMajor -lt 18) { Write-Fail "Node.js 18+ required"; exit 1 } } catch { Write-Fail "Node.js not found. Install from https://nodejs.org"; exit 1 }
try { $npmVersion = npm --version; Write-Success "npm found: $npmVersion" } catch { Write-Fail "npm not found"; exit 1 }
Write-Step "Ensuring directory structure"
$dirs = @("client\src\components","client\src\pages","client\src\hooks","client\src\services","client\src\assets","client\src\styles","server\src\routes","server\src\controllers","server\src\middleware","server\src\services","server\src\models","server\src\providers","server\src\utils","server\src\config","server\prisma","server\tests","docs","scripts","mock-data")
foreach ($dir in $dirs) { $fp = Join-Path $ProjectRoot $dir; if (-not (Test-Path $fp)) { New-Item -ItemType Directory -Path $fp -Force | Out-Null; Write-Success "Created: $dir" } }
Write-Success "Directory structure verified"
Write-Step "Setting up environment"
$envPath = Join-Path $ProjectRoot ".env"; $envEx = Join-Path $ProjectRoot ".env.example"
if (-not (Test-Path $envPath)) { if (Test-Path $envEx) { Copy-Item $envEx $envPath; Write-Success "Created .env from .env.example"; Write-Warn "Please edit .env and set your JWT_SECRET and API keys" } else { Write-Warn ".env.example not found" } } else { Write-Success ".env already exists" }
if (-not $SeedOnly -and -not $SkipInstall) {
    Write-Step "Installing backend dependencies"
    $spj = Join-Path $ProjectRoot "server\package.json"
    if (Test-Path $spj) { Push-Location (Join-Path $ProjectRoot "server"); npm install; Pop-Location; Write-Success "Backend installed" } else { Write-Warn "server/package.json not found - Phase 1 not yet implemented" }
    Write-Step "Installing frontend dependencies"
    $cpj = Join-Path $ProjectRoot "client\package.json"
    if (Test-Path $cpj) { Push-Location (Join-Path $ProjectRoot "client"); npm install; Pop-Location; Write-Success "Frontend installed" } else { Write-Warn "client/package.json not found - Phase 4 not yet implemented" }
}
Write-Step "Setting up database"
$ps = Join-Path $ProjectRoot "server\prisma\schema.prisma"
if (Test-Path $ps) { Push-Location (Join-Path $ProjectRoot "server"); npx prisma generate; npx prisma db push; Write-Success "Database ready"; $sd = Join-Path $ProjectRoot "server\prisma\seed.js"; if (Test-Path $sd) { node prisma\seed.js; Write-Success "Mock data seeded" } else { Write-Warn "No seed script" }; Pop-Location } else { Write-Warn "Prisma schema not found - Phase 1 not yet implemented" }
Write-Step "Setup Complete"
Write-Host ""; Write-Host "Next steps:" -ForegroundColor White; Write-Host "  1. Edit .env with your configuration" -ForegroundColor Gray; Write-Host "  2. Start backend:  cd server; npm run dev" -ForegroundColor Gray; Write-Host "  3. Start frontend: cd client; npm run dev" -ForegroundColor Gray; Write-Host ""
