$ProjectDir = "C:\Users\mohal\Documents\antigravity\ForensicReview"
$ElectronExe = "$ProjectDir\node_modules\electron\dist\electron.exe"
$MainScript  = "$ProjectDir\electron\main.cjs"
$IconFile    = "$ProjectDir\public\app-icon-white.ico"

$WshShell = New-Object -ComObject WScript.Shell

# 1. Desktop Shortcut
$DesktopPath = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::Desktop)
$DesktopShortcutPath = Join-Path $DesktopPath "ForensicReview.lnk"
$Shortcut = $WshShell.CreateShortcut($DesktopShortcutPath)
$Shortcut.TargetPath = $ElectronExe
$Shortcut.Arguments = "`"$MainScript`""
$Shortcut.WorkingDirectory = $ProjectDir
$Shortcut.IconLocation = "$IconFile, 0"
$Shortcut.Description = "ForensicReview - Medicolegal Forensic Workstation (Dr. A. Alex Mohit)"
$Shortcut.Save()
Write-Host "Updated Desktop Shortcut: $DesktopShortcutPath"

# 2. Start Menu Shortcut
$StartMenuPath = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::Programs)
$StartMenuShortcutPath = Join-Path $StartMenuPath "ForensicReview.lnk"
$StartShortcut = $WshShell.CreateShortcut($StartMenuShortcutPath)
$StartShortcut.TargetPath = $ElectronExe
$StartShortcut.Arguments = "`"$MainScript`""
$StartShortcut.WorkingDirectory = $ProjectDir
$StartShortcut.IconLocation = "$IconFile, 0"
$StartShortcut.Description = "ForensicReview - Medicolegal Forensic Workstation (Dr. A. Alex Mohit)"
$StartShortcut.Save()
Write-Host "Updated Start Menu Shortcut: $StartMenuShortcutPath"

# 3. Pinned Taskbar Shortcut (if exists)
$TaskbarPath = Join-Path $env:APPDATA "Microsoft\Internet Explorer\Quick Launch\User Pinned\TaskBar\ForensicReview.lnk"
if (Test-Path $TaskbarPath) {
    $TbShortcut = $WshShell.CreateShortcut($TaskbarPath)
    $TbShortcut.TargetPath = $ElectronExe
    $TbShortcut.Arguments = "`"$MainScript`""
    $TbShortcut.WorkingDirectory = $ProjectDir
    $TbShortcut.IconLocation = "$IconFile, 0"
    $TbShortcut.Description = "ForensicReview - Medicolegal Forensic Workstation (Dr. A. Alex Mohit)"
    $TbShortcut.Save()
    Write-Host "Updated TaskBar Pinned Shortcut: $TaskbarPath"
}
