@echo off
echo ============================================================
echo   AquaSentinel Full-Stack Launcher (VS Code Windows)
echo ============================================================

start cmd /k "cd backend && if not exist venv (python -m venv venv) && call venv\Scripts\activate && pip install -r requirements.txt && python app.py"

cd frontend
call npm install
call npm run dev
pause
