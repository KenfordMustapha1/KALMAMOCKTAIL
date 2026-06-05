@echo off
echo Changing DNS to Google Public DNS...
echo.

REM Get the network interface name
for /f "tokens=2 delims=:" %%A in ('ipconfig /all ^| findstr /i "Description.*Wi-Fi"') do set interface=%%A

echo Using interface: %interface%
echo.

REM Backup current DNS settings
echo Backing up current DNS settings...
netsh interface ipv4 show dnsservers > dns_backup.txt

REM Set Google's public DNS
echo Setting DNS to Google (8.8.8.8, 8.8.4.4)...
netsh interface ipv4 set dnsservers name="Wi-Fi" static 8.8.8.8 primary
netsh interface ipv4 add dnsservers name="Wi-Fi" 8.8.4.4 index=2

echo.
echo DNS changed successfully!
echo Testing DNS resolution...
timeout /t 2 /nobreak

nslookup cluster0.cyvczvm.mongodb.net
echo.
echo DNS test complete. Press Enter to close.
pause
