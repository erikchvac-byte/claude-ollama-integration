# Windows Startup Task for Ollama Auto-Start

**Date**: 2026-01-01
**Status**: ✅ Active
**Task Name**: `OllamaAutoStart`

---

## What Was Done

Created a Windows Scheduled Task that automatically starts Ollama when you log into Windows.

### Why This Approach?

The SessionStart hook (in `.claude/hooks/SessionStart.md`) **does not execute reliably** in the VSCode extension environment. After testing, we determined that:

1. **SessionStart hooks may only work in Claude Code CLI**, not the VSCode extension
2. **Timing issues** prevent reliable auto-start from hooks
3. **Windows Scheduled Tasks** are the most reliable method for auto-starting services on login

---

## Task Details

```
Name:        OllamaAutoStart
Description: Auto-start Ollama service on Windows login for Claude Code integration
Runs:        ollama.exe serve
Trigger:     At login for user: erikc
Settings:
  - Runs even on battery power
  - Doesn't stop if switching to battery
  - No execution time limit
  - Starts when available
```

---

## How to Verify

### Check Task Exists

```powershell
Get-ScheduledTask -TaskName "OllamaAutoStart"
```

**Expected output**:
```
TaskName         State
--------         -----
OllamaAutoStart  Ready
```

### View Task Details

```powershell
Get-ScheduledTask -TaskName "OllamaAutoStart" | Select-Object * | Format-List
```

### Open Task Scheduler GUI

```powershell
taskschd.msc
```

Look for "OllamaAutoStart" in the Task Scheduler Library.

---

## Testing

### Test Without Restarting

```powershell
# Manually trigger the task
Start-ScheduledTask -TaskName "OllamaAutoStart"

# Wait a few seconds, then check if Ollama is running
Start-Sleep -Seconds 3
Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -UseBasicParsing
```

### Test After Restart

1. **Restart your PC**
2. **Log back into Windows**
3. **Wait 5-10 seconds** for the task to execute
4. **Check if Ollama is running**:
   ```powershell
   curl http://localhost:11434/api/tags
   ```

Expected: Should return JSON with list of models (no connection error)

---

## Managing the Task

### Disable Auto-Start (Temporarily)

```powershell
Disable-ScheduledTask -TaskName "OllamaAutoStart"
```

### Enable Auto-Start

```powershell
Enable-ScheduledTask -TaskName "OllamaAutoStart"
```

### Remove the Task Completely

```powershell
Unregister-ScheduledTask -TaskName "OllamaAutoStart" -Confirm:$false
```

### Recreate the Task

If you need to recreate it:

```powershell
cd C:\Users\erikc\Dev\claude-ollama-integration
.\create-ollama-startup-task.ps1
```

---

## Troubleshooting

### Task Exists but Ollama Doesn't Start

1. **Check task status**:
   ```powershell
   Get-ScheduledTask -TaskName "OllamaAutoStart" | Select-Object State
   ```
   Should show: `Ready`

2. **Check last run result**:
   ```powershell
   Get-ScheduledTaskInfo -TaskName "OllamaAutoStart" | Select-Object LastRunTime, LastTaskResult
   ```
   `LastTaskResult` should be `0` (success)

3. **Check if ollama.exe is in PATH**:
   ```powershell
   Get-Command ollama
   ```
   Should show the path to ollama.exe

4. **Run task manually**:
   ```powershell
   Start-ScheduledTask -TaskName "OllamaAutoStart"
   ```

### Task Runs but Ollama Stops

If Ollama starts but then stops:
- Check Windows Event Viewer for errors
- Verify Ollama installation is intact
- Try running `ollama serve` manually to see error messages

### Task Doesn't Trigger at Login

1. **Check trigger settings**:
   ```powershell
   (Get-ScheduledTask -TaskName "OllamaAutoStart").Triggers
   ```

2. **Verify user name**:
   ```powershell
   $env:USERNAME
   ```
   Should match the trigger user

3. **Recreate the task** using `create-ollama-startup-task.ps1`

---

## Files

- **Script**: `create-ollama-startup-task.ps1` - Creates the scheduled task
- **This Doc**: `WINDOWS_STARTUP_TASK.md` - Documentation

---

## Comparison: Hook vs Scheduled Task

| Method | Reliability | Scope | Notes |
|--------|-------------|-------|-------|
| SessionStart Hook | ❌ Low | Per-project | Doesn't work in VSCode extension |
| Windows Scheduled Task | ✅ High | System-wide | Works every login, regardless of project |

---

## Next Login Behavior

**What will happen**:

1. You log into Windows
2. Within 5-10 seconds, the `OllamaAutoStart` task executes
3. `ollama serve` starts in the background (no visible window)
4. Ollama is ready for Claude Code integration
5. When you open VSCode, Ollama is already running
6. MCP server connects immediately
7. No manual intervention needed!

---

## Summary

✅ **Scheduled task created**: `OllamaAutoStart`
✅ **Triggers at**: Windows login
✅ **Runs**: `ollama.exe serve`
✅ **Status**: Active and ready
✅ **Next restart**: Ollama will auto-start

**No more manual `ollama serve` after restarts!** 🚀

---

## Related Files

- [SessionStart hook](../.claude/hooks/SessionStart.md) - Still useful for auto-install on new projects
- [SESSIONSTART_HOOK_UPDATE.md](SESSIONSTART_HOOK_UPDATE.md) - Hook rewrite attempt (didn't solve auto-start)
- [create-ollama-startup-task.ps1](create-ollama-startup-task.ps1) - Script to create this task
