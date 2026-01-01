# Helper Script to Push to GitHub
# Run this after creating the repository on GitHub

$ErrorActionPreference = "Stop"

Write-Host "🚀 Push to GitHub Helper" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (!(Test-Path ".git")) {
    Write-Host "❌ Error: Not in a git repository" -ForegroundColor Red
    Write-Host "Please run this from: c:\Users\erikc\Dev\claude-ollama-integration\" -ForegroundColor Yellow
    exit 1
}

Write-Host "📝 Before running this script, make sure you:" -ForegroundColor Yellow
Write-Host "   1. Created the repository on GitHub (https://github.com/new)" -ForegroundColor White
Write-Host "   2. Named it: claude-ollama-integration" -ForegroundColor White
Write-Host "   3. Did NOT initialize with README" -ForegroundColor White
Write-Host ""

$confirm = Read-Host "Have you created the repository on GitHub? (y/n)"
if ($confirm -ne "y") {
    Write-Host "Please create the repository first, then run this script again." -ForegroundColor Yellow
    Write-Host "Go to: https://github.com/new" -ForegroundColor Cyan
    exit 0
}

Write-Host ""
Write-Host "[1/4] Checking for existing remote..." -ForegroundColor Cyan
$hasRemote = git remote -v 2>&1 | Select-String "origin"
if ($hasRemote) {
    Write-Host "  ⚠️  Remote 'origin' already exists. Removing it..." -ForegroundColor Yellow
    git remote remove origin
}

Write-Host ""
Write-Host "[2/4] Adding GitHub remote..." -ForegroundColor Cyan
git remote add origin https://github.com/erikchvac-byte/claude-ollama-integration.git
Write-Host "  ✓ Remote added: https://github.com/erikchvac-byte/claude-ollama-integration.git" -ForegroundColor Green

Write-Host ""
Write-Host "[3/4] Renaming branch to 'main'..." -ForegroundColor Cyan
git branch -M main
Write-Host "  ✓ Branch renamed to 'main'" -ForegroundColor Green

Write-Host ""
Write-Host "[4/4] Pushing to GitHub..." -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  IMPORTANT: When prompted for credentials:" -ForegroundColor Yellow
Write-Host "   Username: erikchvac-byte" -ForegroundColor White
Write-Host "   Password: Use a Personal Access Token (NOT your GitHub password)" -ForegroundColor White
Write-Host ""
Write-Host "   Generate a token at: https://github.com/settings/tokens" -ForegroundColor Cyan
Write-Host "   Select scope: 'repo' (full control)" -ForegroundColor Cyan
Write-Host ""

git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host "✅ SUCCESS! Your repository is now on GitHub!" -ForegroundColor Green
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 View it at:" -ForegroundColor Cyan
    Write-Host "   https://github.com/erikchvac-byte/claude-ollama-integration" -ForegroundColor White
    Write-Host ""
    Write-Host "📝 Next steps:" -ForegroundColor Yellow
    Write-Host "   • Visit the repository and add topics/tags" -ForegroundColor White
    Write-Host "   • Star your own repository" -ForegroundColor White
    Write-Host "   • Share the link with others" -ForegroundColor White
    Write-Host "   • Add a license if desired" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Push failed. Common issues:" -ForegroundColor Red
    Write-Host ""
    Write-Host "1. Authentication failed:" -ForegroundColor Yellow
    Write-Host "   → Use a Personal Access Token, not your password" -ForegroundColor White
    Write-Host "   → Generate at: https://github.com/settings/tokens" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "2. Repository doesn't exist:" -ForegroundColor Yellow
    Write-Host "   → Create it at: https://github.com/new" -ForegroundColor Cyan
    Write-Host "   → Name must be: claude-ollama-integration" -ForegroundColor White
    Write-Host ""
    Write-Host "3. Wrong username:" -ForegroundColor Yellow
    Write-Host "   → Make sure it's: erikchvac-byte" -ForegroundColor White
    Write-Host ""
}
