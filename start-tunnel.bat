@echo off
cd /d "%~dp0"
title Ostrov Sudby - Public Tunnel
echo.
echo  Sozdaem publichnuyu ssylku cherez localtunnel...
echo  Sayt dolzhen uzhe rabotat na http://localhost:8090
echo.
echo  Posle zapuska poyavitsya ssylka vida https://....loca.lt
echo  Ey mozhno delitsya s lyubym chelovekom.
echo.
npx --yes localtunnel --port 8090
pause
