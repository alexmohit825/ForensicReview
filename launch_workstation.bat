@echo off
title ForensicReview Desktop Workstation
echo Starting ForensicReview Workstation...
cd /d "C:\Users\mohal\Documents\antigravity\ForensicReview"
python -m streamlit run app_desktop.py --server.port 8501 --server.headless false
pause
