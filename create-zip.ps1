# PowerShell скрипт для создания ZIP архива
# Запустите: .\create-zip.ps1

$files = @(
    "index.html",
    "style.css",
    "script.js",
    "manifest.json",
    "service-worker.js",
    "README.md",
    "create-icons.html",
    "generate-icons.js"
)

$zipName = "Calculator-PWA.zip"

# Удалить старый архив если существует
if (Test-Path $zipName) {
    Remove-Item $zipName
}

# Создать ZIP архив
Compress-Archive -Path $files -DestinationPath $zipName -Force

Write-Host "Архив создан: $zipName" -ForegroundColor Green
Write-Host "Файлы в архиве:" -ForegroundColor Yellow
$files | ForEach-Object { Write-Host "  - $_" }



