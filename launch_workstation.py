import os
import sys
import time
import socket
import urllib.request
import webbrowser
import subprocess

PORT = 8501
URL = f"http://localhost:{PORT}"

def is_server_ready():
    try:
        req = urllib.request.urlopen(URL, timeout=1)
        return req.status in [200, 304]
    except Exception:
        return False

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    app_script = os.path.join(base_dir, "app_desktop.py")
    python_exe = sys.executable

    # If the server is already active and healthy, simply open browser
    if is_server_ready():
        webbrowser.open(URL)
        return

    # Use PowerShell WMI / CIM to spawn detached background Streamlit without holding parent process
    ps_cmd = (
        f'Invoke-CimMethod -ClassName Win32_Process -MethodName Create '
        f'-Arguments @{{CommandLine="cmd.exe /c start /min \\"{python_exe}\\" -m streamlit run \\"{app_script}\\" --server.port {PORT} --server.headless false"; '
        f'CurrentDirectory=\\"{base_dir}\\"}}'
    )

    subprocess.run(
        ["powershell", "-NoProfile", "-WindowStyle", "Hidden", "-Command", ps_cmd],
        capture_output=True,
        creationflags=subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0
    )

    # Poll until server responds (max 15 seconds)
    start = time.time()
    while time.time() - start < 15:
        if is_server_ready():
            break
        time.sleep(0.4)

    webbrowser.open(URL)

if __name__ == "__main__":
    main()
