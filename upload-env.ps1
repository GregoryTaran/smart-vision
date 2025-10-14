# === Upload all variables from .local.env to Firebase Secrets ===
Write-Host "🚀 Uploading environment variables from functions\.local.env to Firebase..."

$envFile = "functions\.local.env"
$project = "smart-vision-888"

if (-Not (Test-Path $envFile)) {
    Write-Host "❌ File not found: $envFile"
    exit 1
}

# Читаем все строки, фильтруем пустые и комментарии
Get-Content $envFile | Where-Object { $_ -match '^\s*[^#].+=.+$' } | ForEach-Object {
    $k, $v = $_ -split '=', 2
    $k = $k.Trim()
    $v = $v.Trim()

    if ($k -and $v) {
        Write-Host "⬆️  Setting $k ..."
        # Старый синтаксис без --data
        echo $v | firebase functions:secrets:set $k --project $project --force | Out-Null
    }
}

Write-Host "✅ All variables uploaded successfully to Firebase project '$project'!"
