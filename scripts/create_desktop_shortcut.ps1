$ProjectDir = "C:\Users\mohal\Documents\antigravity\ForensicReview"
$ExePath    = "$ProjectDir\ForensicReview.exe"
$IconFile   = "$ProjectDir\public\app-icon-white.ico"

# Ensure ForensicReview.exe exists and is up to date
if (-not (Test-Path $ExePath)) {
    Write-Host "Compiling ForensicReview.exe..."
    & "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe" /target:winexe /win32icon:$IconFile /out:$ExePath "$ProjectDir\Launcher.cs"
}

$WshShell = New-Object -ComObject WScript.Shell

# Helper to create shortcut
function New-AppShortcut($ShortcutPath, $Target, $WorkDir, $Icon, $Desc) {
    $dir = Split-Path -Path $ShortcutPath -Parent
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
    $sc = $WshShell.CreateShortcut($ShortcutPath)
    $sc.TargetPath = $Target
    $sc.Arguments = ""
    $sc.WorkingDirectory = $WorkDir
    $sc.IconLocation = "$Icon, 0"
    $sc.Description = $Desc
    $sc.Save()
    Write-Host "Created shortcut: $ShortcutPath"
}

# 1. Main Desktop (OneDrive redirected)
$DesktopPath = "C:\Users\mohal\OneDrive\Desktop"
New-AppShortcut -ShortcutPath (Join-Path $DesktopPath "ForensicReview.lnk") `
                -Target $ExePath `
                -WorkDir $ProjectDir `
                -Icon $IconFile `
                -Desc "ForensicReview - Medicolegal Forensic & Standard of Care Workstation (Dr. A. Alex Mohit)"

# 2. AG Apps Folder on Desktop
$AgAppsPath = "C:\Users\mohal\OneDrive\Desktop\AG Apps"
if (Test-Path $AgAppsPath) {
    New-AppShortcut -ShortcutPath (Join-Path $AgAppsPath "ForensicReview.lnk") `
                    -Target $ExePath `
                    -WorkDir $ProjectDir `
                    -Icon $IconFile `
                    -Desc "ForensicReview - Medicolegal Forensic Workstation"
}

# 3. Start Menu Programs
$StartMenuPath = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::Programs)
New-AppShortcut -ShortcutPath (Join-Path $StartMenuPath "ForensicReview.lnk") `
                -Target $ExePath `
                -WorkDir $ProjectDir `
                -Icon $IconFile `
                -Desc "ForensicReview - Medicolegal Forensic Workstation"

# 4. User Pinned Taskbar
$TaskbarPath = Join-Path $env:APPDATA "Microsoft\Internet Explorer\Quick Launch\User Pinned\TaskBar\ForensicReview.lnk"
New-AppShortcut -ShortcutPath $TaskbarPath `
                -Target $ExePath `
                -WorkDir $ProjectDir `
                -Icon $IconFile `
                -Desc "ForensicReview - Medicolegal Forensic Workstation"

# 5. Public Desktop (fallback so any view of Desktop sees it)
$PublicDesktop = "C:\Users\Public\Desktop"
if (Test-Path $PublicDesktop) {
    New-AppShortcut -ShortcutPath (Join-Path $PublicDesktop "ForensicReview.lnk") `
                    -Target $ExePath `
                    -WorkDir $ProjectDir `
                    -Icon $IconFile `
                    -Desc "ForensicReview - Medicolegal Forensic Workstation"
}

# 6. Notify Windows Shell to Refresh Desktop and Taskbar Icons immediately
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class ShellNotifier {
    [DllImport("shell32.dll")]
    public static extern void SHChangeNotify(int eventId, int flags, IntPtr item1, IntPtr item2);
}
"@ -ErrorAction SilentlyContinue

try {
    [ShellNotifier]::SHChangeNotify(0x08000000, 0x0000, [IntPtr]::Zero, [IntPtr]::Zero)
    Write-Host "Windows Shell notified: Icon cache refreshed."
} catch {
    Write-Host "Shell notification attempted."
}
