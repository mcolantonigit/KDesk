@echo off
cd /d "C:\Repo\KDesk\backend"
"C:\Program Files\nodejs\node.exe" "C:\Repo\KDesk\backend\server.js" >> "C:\Repo\KDesk\backend\logs\backend.log" 2>&1
