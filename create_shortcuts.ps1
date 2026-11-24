$wscript = New-Object -ComObject WScript.Shell

$scriptDir = $PSScriptRoot
if (-not $scriptDir) {
    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
}
if (-not $scriptDir) {
    $scriptDir = (Get-Location).Path
}

$desktopLnk = [System.IO.Path]::Combine([System.Environment]::GetFolderPath('Desktop'), 'ForensicReview App.lnk')
$startLnk = [System.IO.Path]::Combine([System.Environment]::GetFolderPath('Programs'), 'ForensicReview App.lnk')
$icoPath = Join-Path $scriptDir 'app_icon.ico'
$pywCmd = Get-Command pythonw.exe -ErrorAction SilentlyContinue
$pywPath = if ($pywCmd) { $pywCmd.Source } else { 'pythonw.exe' }
$appScript = Join-Path $scriptDir 'app_native.py'
$workDir = $scriptDir

foreach ($path in @($desktopLnk, $startLnk)) {
    $shortcut = $wscript.CreateShortcut($path)
    $shortcut.TargetPath = $pywPath
    $shortcut.Arguments = "`"$appScript`""
    $shortcut.WorkingDirectory = $workDir
    if (Test-Path $icoPath) {
        $shortcut.IconLocation = "$icoPath,0"
    }
    $shortcut.Description = 'ForensicReview - Medicolegal Spine Workstation'
    $shortcut.Save()
    Write-Host "Configured shortcut: $path with icon: $icoPath"
}
