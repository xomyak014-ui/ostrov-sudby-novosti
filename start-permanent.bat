@echo off
cd /d "%~dp0"
title Ostrov Sudby - Postoyannaya ssylka
powershell -ExecutionPolicy Bypass -File "%~dp0start-permanent-tunnel.ps1"
pause
