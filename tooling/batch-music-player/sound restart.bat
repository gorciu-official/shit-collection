@echo off
echo Wait!
start /min cmd /c "sound stop.bat"
ping localhost -n 2 > nul
start /min cmd /c "sound start.bat"