$wscript = New-Object -ComObject WScript.Shell

$desktopLnk = [System.IO.Path]::Combine([System.Environment]::GetFolderPath('Desktop'), 'ForensicReview App.lnk')
$startLnk = [System.IO.Path]::Combine([System.Environment]::GetFolderPath('Programs'), 'ForensicReview App.lnk')
$icoPath = 'C:\Users\mohal\Documents\antigravity\ForensicReview\app_icon.ico'
$pywCmd = Get-Command pythonw.exe -ErrorAction SilentlyContinue
$pywPath = if ($pywCmd) { $pywCmd.Source } else { 'C:\Users\mohal\AppData\Local\Programs\Python\Python312\pythonw.exe' }
$appScript = 'C:\Users\mohal\Documents\antigravity\ForensicReview\app_native.py'
$workDir = 'C:\Users\mohal\Documents\antigravity\ForensicReview'

foreach ($path in @($desktopLnk, $startLnk)) {
    $shortcut = $wscript.CreateShortcut($path)
    $shortcut.TargetPath = $pywPath
    $shortcut.Arguments = "`"$appScript`""
    $shortcut.WorkingDirectory = $workDir
    $shortcut.IconLocation = "$icoPath,0"
    $shortcut.Description = 'ForensicReview - Medicolegal Spine Workstation'
    $shortcut.Save()
    Write-Host "Configured shortcut: $path with icon: $icoPath"
}
