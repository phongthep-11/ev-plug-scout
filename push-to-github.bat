@echo off
chcp 65001 > nul
echo =======================================================
echo   ⚡ EV Plug Scout - กำลังส่งโค้ดขึ้น GitHub 🚀
echo =======================================================
echo.
cd /d "d:\EV BY NICK"
echo [1/2] ตรวจสอบความพร้อมของ Git...
git status -s
echo.
echo [2/2] กำลัง Push ขึ้น GitHub...
echo (หากมีหน้าต่างเบราว์เซอร์เด้งขึ้นมา ให้กด 'Sign in' หรือ 'Authorize' นะครับ)
echo.
git push -u origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo =======================================================
    echo   🎉 ส่งโค้ดขึ้น GitHub สำเร็จเรียบร้อยแล้ว!
    echo   เข้าไปดูที่แท็บ Actions ใน GitHub เพื่อดาวน์โหลดไฟล์ APK ได้เลยครับ:
    echo   https://github.com/phongthep-11/ev-plug-scout/actions
    echo =======================================================
) else (
    echo.
    echo ❌ เกิดข้อผิดพลาดในการ Push กรุณาตรวจสอบการล็อกอิน GitHub อีกครั้ง
)
echo.
pause
