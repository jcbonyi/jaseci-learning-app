# quickstart.ps1
# Quick-start script for Interactive Learning Platform for Jac/Jaseci
# This script scaffolds the project, installs all dependencies, and optionally starts the servers.
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File quickstart.ps1
#
# Or from PowerShell:
#   .\quickstart.ps1

$ErrorActionPreference = "Stop"

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Interactive Learning Platform - Quick Start                   ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Define project root
$projectRoot = "c:\Users\ADMIN\Desktop\OUC LECTURES\JASECI_APP"
$backendDir = Join-Path $projectRoot "backend"
$frontendDir = Join-Path $projectRoot "frontend"

# Check if directories exist
if (-not (Test-Path $backendDir)) {
    Write-Host "ERROR: Backend directory not found at $backendDir" -ForegroundColor Red
    exit 1
}
if (-not (Test-Path $frontendDir)) {
    Write-Host "ERROR: Frontend directory not found at $frontendDir" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Project directories found" -ForegroundColor Green
Write-Host "  Backend:  $backendDir" -ForegroundColor Gray
Write-Host "  Frontend: $frontendDir" -ForegroundColor Gray
Write-Host ""

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js not found. Please install from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version
    Write-Host "✓ npm found: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: npm not found" -ForegroundColor Red
    exit 1
}

# Check Jac (optional but recommended)
try {
    $jacVersion = jac --version
    Write-Host "✓ Jac found: $jacVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠ Jac not found in PATH. Backend build may fail." -ForegroundColor Yellow
    Write-Host "  Install Jac: https://github.com/Jaseci-Labs/jaseci" -ForegroundColor Gray
}

Write-Host ""

# Install frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
Push-Location $frontendDir
try {
    npm install
    Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Frontend npm install failed" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location

Write-Host ""

# Offer to build backend
Write-Host "Build backend Jac project?" -ForegroundColor Yellow
Write-Host "  (Requires jac build and jac run to be available)" -ForegroundColor Gray
$buildBackend = Read-Host "Build backend? (y/n)"

if ($buildBackend -eq "y" -or $buildBackend -eq "Y") {
    Write-Host ""
    Write-Host "Building backend..." -ForegroundColor Yellow
    Push-Location $backendDir
    try {
        jac build
        Write-Host "✓ Backend built successfully" -ForegroundColor Green
    } catch {
        Write-Host "ERROR: Backend build failed" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    Pop-Location
}

Write-Host ""

# Summary
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  Setup Complete!                                               ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Start the Backend (in one terminal):" -ForegroundColor White
Write-Host "   cd $backendDir" -ForegroundColor Gray
Write-Host "   jac run" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Start the Frontend (in another terminal):" -ForegroundColor White
Write-Host "   cd $frontendDir" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Open your browser:" -ForegroundColor White
Write-Host "   http://localhost:5173" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Run demo tests:" -ForegroundColor White
Write-Host "   See INTEGRATION_TEST.md for step-by-step walkthrough" -ForegroundColor Gray
Write-Host ""

# Optional: Start servers
Write-Host "Would you like to start the servers now?" -ForegroundColor Yellow
$startServers = Read-Host "Start servers? (y/n)"

if ($startServers -eq "y" -or $startServers -eq "Y") {
    Write-Host ""
    Write-Host "Starting frontend dev server..." -ForegroundColor Yellow
    Push-Location $frontendDir
    
    # Start frontend in background (if possible) or new window
    Write-Host "Opening new terminal for frontend..." -ForegroundColor Gray
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendDir'; npm run dev"
    
    Write-Host "Frontend started in new terminal" -ForegroundColor Green
    Pop-Location
    
    Write-Host ""
    Write-Host "For the backend, run this in another terminal:" -ForegroundColor Yellow
    Write-Host "  cd $backendDir" -ForegroundColor Gray
    Write-Host "  jac run" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "Happy coding! 🚀" -ForegroundColor Cyan
Write-Host ""
