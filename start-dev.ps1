# PowerShell script to start backend and frontend development servers
# Usage: .\start-dev.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Development Servers" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get the script directory (project root)
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Check if uv is installed
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
$uvInstalled = Get-Command uv -ErrorAction SilentlyContinue
if (-not $uvInstalled) {
    Write-Host "ERROR: 'uv' is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Install it with: pip install uv" -ForegroundColor Yellow
    exit 1
}

# Check if node is installed
$nodeInstalled = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeInstalled) {
    Write-Host "ERROR: 'node' is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

Write-Host "Prerequisites check passed!" -ForegroundColor Green
Write-Host ""

# Check if backend dependencies are installed
$backendPath = Join-Path $scriptPath "backend"
if (-not (Test-Path (Join-Path $backendPath ".venv"))) {
    Write-Host "Backend dependencies not found. Installing..." -ForegroundColor Yellow
    Set-Location $backendPath
    uv sync
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to install backend dependencies" -ForegroundColor Red
        exit 1
    }
    Set-Location $scriptPath
    Write-Host "Backend dependencies installed!" -ForegroundColor Green
}

# Check if frontend dependencies are installed
$frontendPath = Join-Path $scriptPath "frontend"
if (-not (Test-Path (Join-Path $frontendPath "node_modules"))) {
    Write-Host "Frontend dependencies not found. Installing..." -ForegroundColor Yellow
    Set-Location $frontendPath
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to install frontend dependencies" -ForegroundColor Red
        exit 1
    }
    Set-Location $scriptPath
    Write-Host "Frontend dependencies installed!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Starting servers in separate windows..." -ForegroundColor Cyan
Write-Host ""

# Start backend in a new window
Write-Host "Starting Backend (http://localhost:8000)..." -ForegroundColor Green
$backendScript = @"
Set-Location '$backendPath'
Write-Host '========================================' -ForegroundColor Cyan
Write-Host 'Backend Server (FastAPI)' -ForegroundColor Cyan
Write-Host '========================================' -ForegroundColor Cyan
Write-Host 'Starting on http://localhost:8000' -ForegroundColor Yellow
Write-Host 'Press Ctrl+C to stop' -ForegroundColor Gray
Write-Host ''
uv run uvicorn backend.app:app --reload --host 0.0.0.0 --port 8000
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendScript

# Wait a moment for backend to start
Start-Sleep -Seconds 2

# Start frontend in a new window
Write-Host "Starting Frontend (http://localhost:3000)..." -ForegroundColor Green
$frontendScript = @"
Set-Location '$frontendPath'
Write-Host '========================================' -ForegroundColor Cyan
Write-Host 'Frontend Server (Next.js)' -ForegroundColor Cyan
Write-Host '========================================' -ForegroundColor Cyan
Write-Host 'Starting on http://localhost:3000' -ForegroundColor Yellow
Write-Host 'Press Ctrl+C to stop' -ForegroundColor Gray
Write-Host ''
npm run dev
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendScript

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Servers are starting!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend:  http://localhost:8000" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Two PowerShell windows have been opened:" -ForegroundColor White
Write-Host "  - One for the backend server" -ForegroundColor Gray
Write-Host "  - One for the frontend server" -ForegroundColor Gray
Write-Host ""
Write-Host "Close those windows or press Ctrl+C in each to stop the servers." -ForegroundColor Gray
Write-Host ""

