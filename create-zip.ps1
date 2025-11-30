# create-zip.ps1
# Creates a zip archive of the Interactive Learning Platform project

Write-Host "Creating zip archive..." -ForegroundColor Cyan

$projectRoot = "c:\Users\ADMIN\Desktop\OUC LECTURES\JASECI_APP"
$outputZip = "c:\Users\ADMIN\Desktop\Interactive_Learning_Platform.zip"

# Remove old zip
if (Test-Path $outputZip) {
    Remove-Item $outputZip -Force
}

# Compress the entire project directory, excluding node_modules
cd $projectRoot
$backendPath = Join-Path $projectRoot "backend"
$frontendPath = Join-Path $projectRoot "frontend"
$readmePath = Join-Path $projectRoot "README.md"
$integrationPath = Join-Path $projectRoot "INTEGRATION_TEST.md"
$quickstartPath = Join-Path $projectRoot "quickstart.ps1"
$gitignorePath = Join-Path $projectRoot ".gitignore"

Write-Host "Archiving:" -ForegroundColor Yellow
Write-Host "  - backend/" -ForegroundColor Gray
Write-Host "  - frontend/" -ForegroundColor Gray
Write-Host "  - documentation files" -ForegroundColor Gray

# Build array of paths to compress
$pathsToCompress = @($backendPath, $frontendPath, $readmePath, $integrationPath, $quickstartPath, $gitignorePath) | Where-Object { Test-Path $_ }

# Create zip
Compress-Archive -Path $pathsToCompress -DestinationPath $outputZip -CompressionLevel Optimal

$size = if (Test-Path $outputZip) { [math]::Round((Get-Item $outputZip).Length / 1KB, 2) } else { 0 }
Write-Host ""
Write-Host "SUCCESS!" -ForegroundColor Green
Write-Host "Archive: Interactive_Learning_Platform.zip" -ForegroundColor Cyan
Write-Host "Size: $size KB" -ForegroundColor Cyan
Write-Host "Location: $outputZip" -ForegroundColor Gray
