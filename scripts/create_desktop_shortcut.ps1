$ProjectDir = "C:\Users\mohal\Documents\antigravity\ForensicReview"
$ElectronExe = "$ProjectDir\node_modules\electron\dist\electron.exe"
$MainScript  = "$ProjectDir\electron\main.cjs"
$IconFile    = "$ProjectDir\public\app-icon.ico"

$WshShell = New-Object -ComObject WScript.Shell

# 1. Create Shortcut on Desktop
$DesktopPath = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::Desktop)
$DesktopShortcutPath = Join-Path $DesktopPath "ForensicReview.lnk"

$Shortcut = $WshShell.CreateShortcut($DesktopShortcutPath)
$Shortcut.TargetPath = $ElectronExe
$Shortcut.Arguments = "`"$MainScript`""
$Shortcut.WorkingDirectory = $ProjectDir
$Shortcut.IconLocation = "$IconFile, 0"
$Shortcut.Description = "ForensicReview - Medicolegal Forensic Workstation (Dr. A. Alex Mohit)"
$Shortcut.Save()
Write-Host "Created Desktop Shortcut: $DesktopShortcutPath"

# 2. Create Shortcut in Windows Start Menu Programs
$StartMenuPath = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::Programs)
$StartMenuShortcutPath = Join-Path $StartMenuPath "ForensicReview.lnk"

$StartShortcut = $WshShell.CreateShortcut($StartMenuShortcutPath)
$StartShortcut.TargetPath = $ElectronExe
$StartShortcut.Arguments = "`"$MainScript`""
$StartShortcut.WorkingDirectory = $ProjectDir
$StartShortcut.IconLocation = "$IconFile, 0"
$StartShortcut.Description = "ForensicReview - Medicolegal Forensic Workstation (Dr. A. Alex Mohit)"
$StartShortcut.Save()
Write-Host "Created Start Menu Shortcut: $StartMenuShortcutPath"

Write-Host "SUCCESS: Desktop and Start Menu shortcuts created successfully."
