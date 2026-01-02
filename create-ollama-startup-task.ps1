# Create Windows Scheduled Task to Auto-Start Ollama on Login
# This script creates a task that runs "ollama serve" when you log into Windows

Write-Host "Creating Windows Scheduled Task for Ollama auto-start..." -ForegroundColor Yellow
Write-Host ""

# Define the action (what to run)
$action = New-ScheduledTaskAction -Execute "ollama.exe" -Argument "serve"

# Define the trigger (when to run - at user login)
$trigger = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME

# Define the settings
$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -ExecutionTimeLimit 0 `
    -StartWhenAvailable

# Register the task
try {
    Register-ScheduledTask `
        -TaskName "OllamaAutoStart" `
        -Action $action `
        -Trigger $trigger `
        -Settings $settings `
        -Description "Auto-start Ollama service on Windows login for Claude Code integration" `
        -Force `
        -ErrorAction Stop

    Write-Host "✅ Scheduled task created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Task Details:" -ForegroundColor Cyan
    Write-Host "  Name: OllamaAutoStart"
    Write-Host "  Runs: ollama.exe serve"
    Write-Host "  Trigger: At login for user: $env:USERNAME"
    Write-Host "  Battery-friendly: Yes (runs on battery, doesn't stop when unplugged)"
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "  1. The task is now active"
    Write-Host "  2. Next time you log into Windows, Ollama will start automatically"
    Write-Host "  3. You can verify in Task Scheduler: taskschd.msc"
    Write-Host ""
    Write-Host "To test now without restarting:" -ForegroundColor Gray
    Write-Host "  Start-ScheduledTask -TaskName 'OllamaAutoStart'"
    Write-Host ""
} catch {
    Write-Host "❌ Error creating scheduled task: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common causes:" -ForegroundColor Yellow
    Write-Host "  - Need to run PowerShell as Administrator"
    Write-Host "  - Task already exists (use -Force to overwrite)"
    Write-Host ""
    Write-Host "Manual creation:" -ForegroundColor Gray
    Write-Host "  1. Open Task Scheduler (taskschd.msc)"
    Write-Host "  2. Create Basic Task"
    Write-Host "  3. Trigger: When I log on"
    Write-Host "  4. Action: Start a program"
    Write-Host "  5. Program: ollama.exe"
    Write-Host "  6. Arguments: serve"
}
