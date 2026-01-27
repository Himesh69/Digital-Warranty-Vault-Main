@echo off
REM Warranty Notification Daily Check Script
REM This script runs the Django management command to check warranties and send notifications

cd /d "c:\Users\lenovo\Downloads\Digital-Warranty-Vault-main\backend"
call venv\Scripts\activate.bat
python manage.py check_warranty_expiry

REM Log the execution
echo [%date% %time%] Warranty check completed >> notification_check.log
