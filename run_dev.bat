@echo off
chcp 65001 > nul
echo ======================================================================
echo    VLU FREELANCE MARKETPLACE - KHOI CHAY HE THONG FULLSTACK (CDTN2)
echo ======================================================================
echo.
echo [1/2] Dang khoi dong Backend API (Node.js/Express) tai Port 5000...
start "VLU Freelance - Backend Server (Port 5000)" cmd /k "cd server && npm start"

timeout /t 2 /nobreak > nul

echo [2/2] Dang khoi dong Frontend Client (ReactJS + Tailwind) tai Port 5173...
start "VLU Freelance - Frontend Client (Port 5173)" cmd /k "cd client && npm run dev"

timeout /t 2 /nobreak > nul

echo.
echo ======================================================================
echo    HE THONG DA KHOI CHAY THANH CONG!
echo    - Frontend UI Web:  http://localhost:5173
echo    - Backend REST API: http://localhost:5000
echo ======================================================================
echo.
start http://localhost:5173
pause
