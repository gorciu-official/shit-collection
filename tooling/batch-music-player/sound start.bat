@echo off
echo Set Sound = CreateObject("WMPlayer.OCX.7") > %temp%/sound.vbs
echo Sound.URL = "sound.mp3" >> %temp%/sound.vbs
echo Sound.Controls.play >> %temp%/sound.vbs
echo do while Sound.currentmedia.duration = 0 >> %temp%/sound.vbs
echo wscript.sleep 100 >> %temp%/sound.vbs
echo loop >> %temp%/sound.vbs
echo wscript.sleep (int(Sound.currentmedia.duration)+1)*1000 >> %temp%/sound.vbs
echo Starting music and deleting temporary files for player...
start %temp%/sound.vbs
ping localhost -n 2 > nul
del /s /q "%temp%\sound.vbs" > nul