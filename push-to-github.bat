@echo off
cls
echo =======================================================
echo   EV Plug Scout - Push to GitHub
echo =======================================================
echo.
cd /d "%~dp0"
echo [1/2] Checking Git status...
git status -s
echo.
echo [2/2] Pushing code to GitHub...
git push origin main
if %ERRORLEVEL% NEQ 0 goto PUSH_ERROR

echo.
echo =======================================================
echo   SUCCESS: Pushed to GitHub successfully!
echo   GitHub Actions will now compile your Android APK.
echo   Check progress at: https://github.com/phongthep-11/ev-plug-scout/actions
echo =======================================================
goto SCRIPT_END

:PUSH_ERROR
echo.
echo =======================================================
echo   ERROR: Could not push to GitHub.
echo   Please check your network connection.
echo =======================================================

:SCRIPT_END
echo.
pause
