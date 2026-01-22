$ErrorActionPreference = "Stop"

$baseDir = Get-Location
$jsonPath = Join-Path $baseDir "tools-links.json"
$imagesRelPath = "images/logos"
$imagesDir = Join-Path $baseDir $imagesRelPath

# Create images directory if it doesn't exist
if (-not (Test-Path $imagesDir)) {
    New-Item -ItemType Directory -Force -Path $imagesDir | Out-Null
}

# Read JSON
$jsonContent = Get-Content -Raw -Path $jsonPath | ConvertFrom-Json
$tools = $jsonContent.tools

$updatedTools = @()

foreach ($tool in $tools) {
    Write-Host "Processing: $($tool.title)"
    
    try {
        # Construct Google Favicon URL
        # Using size=128
        $urlObj = [System.Uri]$tool.url
        $domain = $urlObj.Host
        # Google Favicon API
        $logoUrl = "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=$($tool.url)&size=128"
        
        # Create Slug
        $slug = $tool.title.ToLower() -replace '[^a-z0-9]+', '-' -replace '(^-|-$)', ''
        $fileName = "$slug.png"
        $filePath = Join-Path $imagesDir $fileName
        
        # Download
        Invoke-WebRequest -Uri $logoUrl -OutFile $filePath -UserAgent "Mozilla/5.0"
        
        # Update Tool Object (PowerShell generic object manipulation can be tricky, creating custom object)
        $newTool = [pscustomobject]@{
            title = $tool.title
            url = $tool.url
            icon = $tool.icon
            image = "$imagesRelPath/$fileName"
        }
        $updatedTools += $newTool
        
        Write-Host "  Success: $fileName"
    }
    catch {
        Write-Error "  Failed to process $($tool.title): $_"
        # Keep original if failed (add image property as null or missing?)
        # Let's just keep the original properties + image if we have it, else exclude image
        $newTool = [pscustomobject]@{
            title = $tool.title
            url = $tool.url
            icon = $tool.icon
        }
        $updatedTools += $newTool
    }
}

# Reconstruct JSON structure
$newData = [pscustomobject]@{
    tools = $updatedTools
}

# Save JSON
# depth 10 to ensure nested objects process correctly
$jsonString = $newData | ConvertTo-Json -Depth 10
$jsonString | Set-Content -Path $jsonPath -Encoding UTF8

Write-Host "Done! updated tools-links.json"
