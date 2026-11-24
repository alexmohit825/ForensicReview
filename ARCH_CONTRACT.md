# ForensicReview Architecture Contract

## Overview
ForensicReview is a strictly private, physician-operated standalone native Windows medicolegal workstation for Board-Certified Neurosurgical Causation analysis under Washington Pattern Jury Instruction (WPI 30.17). It operates locally on Dr. Mohit's workstation without intermediate cloud web servers or multi-tenant proxies.

## Infrastructure & Runtime Architecture
- **Runtime Environment:** Standalone Windows 11 Native Desktop Application (`PyQt6` via `pythonw.exe`).
- **OS Shell Integration:** Registered Windows `AppUserModelID` (`mohit.forensicreview.workstation.1.0`) with custom gold/navy scales-and-spine icon (`app_icon.ico`) pinned to the Windows taskbar, Desktop, and Start Menu.
- **Local File Processing Engine:** High-performance local C++ `PyMuPDF` (fitz) engine scanning and scoring hundreds of pages in-memory directly from the local NVMe drive.
- **Rule 11 Architectural Standard Compliance (Private Physician Tool Exception):**
  - **No Public Surface Area:** ForensicReview has zero public web URLs, zero public listeners, and no multi-tenant web endpoints.
  - **Direct Client-to-Google Enterprise Pipe:** The application communicates via encrypted TLS directly from the local machine to Google's official Gemini API (`gemini-3.8-flash`) using the Google GenAI SDK.
  - **Zero Intermediate Server Vulnerability:** No third-party servers, Lambda functions, or web proxies touch protected health information (PHI) or discovery dossiers.
  - **Enterprise API Privacy:** Under Google Cloud / Google AI Enterprise Terms of Service, data transmitted through the API endpoint is encrypted in transit and at rest, and is strictly not used to train foundation models.

## Security & API Key Management
- **Local Vault Isolation:** The private `GEMINI_API_KEY` is loaded from a strictly git-ignored local environment file (`.env.local`) or system environment variables.
- **Zero Key Leakage:** Keys are never bundled, committed to source control, or exposed to external clients.
- **Offline Parsing:** All PDF discovery dossiers (up to 200MB+ per matter) are filtered, stripped of non-clinical CD viewer manuals, and processed 100% locally on the CPU/RAM before any encrypted API communication occurs.

## Cross-Machine Deployment & Portability
- **Self-Contained Setup Script:** `setup_new_pc.bat` automates Python verification, pip dependency installation (`PyQt6`, `pymupdf`, `google-genai`, `python-docx`, `python-pptx`), `.env.local` API key configuration, and dynamic Windows shortcut generation across any target machine.
- **Dynamic Shortcut Binding:** `create_shortcuts.ps1` dynamically resolves `$PSScriptRoot` and the local `pythonw.exe` binary path, ensuring seamless setup on new laptops regardless of user profile paths.
