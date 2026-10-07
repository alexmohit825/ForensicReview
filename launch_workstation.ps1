# ForensicReview Workstation Self-Healing Automated Launcher
$port = 8501
$url = "http://localhost:$port"
$taskName = "ForensicReviewWorkstation"

function Test-ServerAlive {
    try {
        $req = [System.Net.WebRequest]::Create($url)
        $req.Timeout = 800
        $resp = $req.GetResponse()
        $resp.Close()
        return $true
    } catch {
        return $false
    }
}

# 1. If server is already answering, immediately open browser and exit
if (Test-ServerAlive) {
    Start-Process $url
    exit 0
}

# 2. Trigger the background scheduled task (runs pythonw silently without console)
schtasks /run /tn $taskName | Out-Null

# 3. Wait up to 10 seconds for the workstation to become active
$timeout = 10
$start = Get-Date
while ((Get-Date) -lt $start.AddSeconds($timeout)) {
    Start-Sleep -Milliseconds 400
    if (Test-ServerAlive) {
        break
    }
}

# 4. Open default web browser directly to ForensicReview Workstation
Start-Process $url
exit 0
