using System;
using System.Diagnostics;
using System.IO;

namespace ForensicReviewLauncher
{
    static class Program
    {
        private const string AppId = "com.forensicreview.workstation";

        [System.Runtime.InteropServices.DllImport("shell32.dll", SetLastError = true)]
        static extern void SetCurrentProcessExplicitAppUserModelID([System.Runtime.InteropServices.MarshalAs(System.Runtime.InteropServices.UnmanagedType.LPWStr)] string AppID);

        [STAThread]
        static void Main()
        {
            try { SetCurrentProcessExplicitAppUserModelID(AppId); } catch { }

            string appDir = @"C:\Users\mohal\Documents\antigravity\ForensicReview";
            string electronExe = Path.Combine(appDir, "node_modules", "electron", "dist", "electron.exe");
            string mainScript = Path.Combine(appDir, "electron", "main.cjs");

            if (!File.Exists(electronExe))
            {
                electronExe = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "node_modules", "electron", "dist", "electron.exe");
                mainScript = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "electron", "main.cjs");
            }

            try
            {
                ProcessStartInfo psi = new ProcessStartInfo();
                psi.FileName = electronExe;
                psi.Arguments = string.Format("\"{0}\"", appDir);
                psi.WorkingDirectory = appDir;
                psi.UseShellExecute = false;

                Process.Start(psi);
            }
            catch (Exception)
            {
                // Fallback in case electron path fails
                Process.Start(new ProcessStartInfo("cmd.exe", "/c npm run desktop") { WorkingDirectory = appDir, WindowStyle = ProcessWindowStyle.Hidden });
            }
        }
    }
}
