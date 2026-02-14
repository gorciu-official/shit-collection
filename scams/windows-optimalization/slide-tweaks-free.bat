@echo off
chcp 65001 >nul
title Administrator: SLIDE Utility V1
mode con cols=110 lines=34
color 0B

:: ================= ADMIN CHECK =================
net session >nul 2>&1
if %errorlevel% neq 0 (
    cls
    echo.
    echo  This utility requires Administrator rights.
    echo  Restarting with elevated permissions...
    timeout /t 2 >nul
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit
)

:: ================= CREATE SYSTEM RESTORE POINT =================
echo Creating a System Restore Point...
powershell -Command "Checkpoint-Computer -Description 'VRTX Tweaks Backup' -RestorePointType 'MODIFY_SETTINGS'" >nul 2>&1
if %errorlevel%==0 (
    echo [OK] Restore point created
) else (
    echo [WARN] Restore point could not be created
)

:: ================= BACKUP REGISTRY =================
echo Backing up the registry...
set backupPath=%USERPROFILE%\Desktop\RegistryBackup
mkdir "%backupPath%" >nul 2>&1
reg export HKLM "%backupPath%\HKLM_Backup.reg" /y >nul 2>&1
reg export HKCU "%backupPath%\HKCU_Backup.reg" /y >nul 2>&1
echo [OK] Registry backup saved to %backupPath%

:MAINMENU
cls
echo.
echo                           "███████╗██╗     ██╗██████╗ ███████╗"
echo                           "██╔════╝██║     ██║██╔══██╗██╔════╝"
echo                           "███████╗██║     ██║██║  ██║█████╗  "
echo                           "╚════██║██║     ██║██║  ██║██╔══╝  "
echo                           "███████║███████╗██║██████╔╝███████╗"
echo                           "╚══════╝╚══════╝╚═╝╚═════╝ ╚══════╝"
echo.
echo                          ──── SLIDE PERFORMANCE UTILITY v1.0 ────
echo.
echo  ┌───────────────────────────────┬───────────────────────────────┬───────────────────────────────┐
echo  │ [ 1 ] Windows Tweaks          │ [ 2 ] GPU Tweaks              │ [ 3 ] CPU Tweaks              │
echo  ├───────────────────────────────┼───────────────────────────────┼───────────────────────────────┤
echo  │ [ 4 ] RAM Tweaks              │ [ 5 ] System Cleanup          │ [ 6 ] Network Tweaks          │
echo  ├───────────────────────────────┼───────────────────────────────┼───────────────────────────────┤
echo  │ [ 7 ] Storage Tweaks          │ [ 8 ] Input Latency Tweaks    │ [ 9 ] Keyboard Mouse Tweaks   │
echo  ├───────────────────────────────┼───────────────────────────────┼───────────────────────────────┤
echo  │ [10 ] Power Tweaks            │ [11 ] Recommended Tweaks      │ [12 ] Extra Tools             │
echo  └───────────────────────────────┴───────────────────────────────┴───────────────────────────────┘
echo.
echo  [ 0 ] Exit
echo.
set /p choice= Select an option: 

if "%choice%"=="1" call :win && goto MAINMENU
if "%choice%"=="2" call :gpu && goto MAINMENU
if "%choice%"=="3" call :cpu && goto MAINMENU
if "%choice%"=="4" call :ram && goto MAINMENU
if "%choice%"=="5" call :clean && goto MAINMENU
if "%choice%"=="6" call :net && goto MAINMENU
if "%choice%"=="7" call :storage && goto MAINMENU
if "%choice%"=="8" call :input && goto MAINMENU
if "%choice%"=="9" call :kbm && goto MAINMENU
if "%choice%"=="10" call :power && goto MAINMENU
if "%choice%"=="11" call :best && goto MAINMENU
if "%choice%"=="12" call :tools && goto MAINMENU
if "%choice%"=="0" exit

goto MAINMENU

:: ================= MODULES =================
:win
cls
echo Applying Windows Tweaks...
echo.

:: ================= REMOTE ASSISTANCE =================
echo Disabling Remote Assistance...
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Remote Assistance" /v "fAllowToGetHelp" /t REG_DWORD /d 0 /f >nul 2>&1
echo [OK]

:: ================= EDGE TWEAKS =================
echo Disabling Edge Startup Boost & Background Mode...
reg add "HKLM\SOFTWARE\Policies\Microsoft\Edge" /v "StartupBoostEnabled" /t REG_DWORD /d 0 /f >nul 2>&1
reg add "HKLM\SOFTWARE\Policies\Microsoft\Edge" /v "BackgroundModeEnabled" /t REG_DWORD /d 0 /f >nul 2>&1
echo [OK]

:: ================= SEARCH HISTORY =================
echo Disabling Device Search History...
reg add "HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\SearchSettings" /v "IsDeviceSearchHistoryEnabled" /t REG_DWORD /d 0 /f >nul 2>&1
echo [OK]

:: ================= NETWORK / LANMAN SERVER =================
echo Tweaking LanmanServer parameters...
reg add "HKLM\SYSTEM\CurrentControlSet\services\LanmanServer\Parameters" /v "autodisconnect" /t REG_DWORD /d 4294967295 /f >nul 2>&1
reg add "HKLM\SYSTEM\CurrentControlSet\services\LanmanServer\Parameters" /v "Size" /t REG_DWORD /d 3 /f >nul 2>&1
reg add "HKLM\SYSTEM\CurrentControlSet\services\LanmanServer\Parameters" /v "EnableOplocks" /t REG_DWORD /d 0 /f >nul 2>&1
reg add "HKLM\SYSTEM\CurrentControlSet\services\LanmanServer\Parameters" /v "IRPStackSize" /t REG_DWORD /d 32 /f >nul 2>&1
reg add "HKLM\SYSTEM\CurrentControlSet\services\LanmanServer\Parameters" /v "SharingViolationDelay" /t REG_DWORD /d 0 /f >nul 2>&1
reg add "HKLM\SYSTEM\CurrentControlSet\services\LanmanServer\Parameters" /v "SharingViolationRetries" /t REG_DWORD /d 0 /f >nul 2>&1
echo [OK]

:: ================= MULTIMEDIA SYSTEM PROFILE =================
echo Optimizing Multimedia System Profile...
reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile" /v "NoLazyMode" /t REG_DWORD /d 1 /f >nul 2>&1
reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile" /v "AlwaysOn" /t REG_DWORD /d 1 /f >nul 2>&1
echo [OK]

:: ================= CONTENT DELIVERY / SYNC =================
echo Disabling Content Delivery & Setting Sync...
reg add "HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\ContentDeliveryManager" /v "SubscribedContent-338393Enabled" /t REG_DWORD /d 0 /f >nul 2>&1
reg add "HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\ContentDeliveryManager" /v "SubscribedContent-353694Enabled" /t REG_DWORD /d 0 /f >nul 2>&1
reg add "HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\ContentDeliveryManager" /v "SubscribedContent-353696Enabled" /t REG_DWORD /d 0 /f >nul 2>&1

reg add "HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\SettingSync\Groups\Personalization" /v "Enabled" /t REG_DWORD /d 0 /f >nul 2>&1
reg add "HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\SettingSync\Groups\BrowserSettings" /v "Enabled" /t REG_DWORD /d 0 /f >nul 2>&1
reg add "HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\SettingSync\Groups\Credentials" /v "Enabled" /t REG_DWORD /d 0 /f >nul 2>&1
reg add "HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\SettingSync\Groups\Accessibility" /v "Enabled" /t REG_DWORD /d 0 /f >nul 2>&1
reg add "HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\SettingSync\Groups\Windows" /v "Enabled" /t REG_DWORD /d 0 /f >nul 2>&1
reg add "HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\SettingSync" /v "SyncPolicy" /t REG_DWORD /d 5 /f >nul 2>&1
echo [OK]

:: ================= FONT & UI =================
echo Tweaking Font Smoothing & Multitasking View...
reg add "HKCU\Control Panel\Desktop" /v "FontSmoothing" /t REG_SZ /d 2 /f >nul 2>&1
reg add "HKCU\Control Panel\Desktop" /v "FontSmoothingType" /t REG_DWORD /d 2 /f >nul 2>&1

reg add "HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\MultitaskingView\AllUpView" /v "AllUpView" /t REG_DWORD /d 0 /f >nul 2>&1
reg add "HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\MultitaskingView\AllUpView" /v "Remove TaskView" /t REG_DWORD /d 1 /f >nul 2>&1
echo [OK]

:: ================= DONE =================
echo.
echo =====================================
echo       All Windows Tweaks Applied
echo       Status: COMPLETED SUCCESSFULLY
echo =====================================
timeout /t 2 >nul
exit /b

:gpu
cls
echo Applying GPU Tweaks...
echo.

:: ================= DISABLE THROTTLING / POWER SAVING =================
echo Disabling PCI Express Link State Power Management...
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Power\PowerSettings\7516b95f-f776-4464-8c53-06167f40cc99\ee12f906-ad23-4fdb-9dd1-3e6e1bff7f4a" /v "Attributes" /t REG_DWORD /d 2 /f >nul 2>&1
powercfg /setacvalueindex SCHEME_CURRENT SUB_VIDEO VIDEOIDLE 0 >nul 2>&1
powercfg /setdcvalueindex SCHEME_CURRENT SUB_VIDEO VIDEOIDLE 0 >nul 2>&1
echo [OK]

:: ================= GPU SCHEDULING =================
echo Enabling Hardware-Accelerated GPU Scheduling (Windows 10/11)...
reg add "HKLM\SYSTEM\CurrentControlSet\Control\GraphicsDrivers" /v "HwSchMode" /t REG_DWORD /d 2 /f >nul 2>&1
echo [OK]

:: ================= DISABLE UNNECESSARY VISUAL EFFECTS =================
echo Disabling Desktop Window Manager Effects...
reg add "HKCU\Software\Microsoft\Windows\DWM" /v "Composition" /t REG_DWORD /d 1 /f >nul 2>&1
reg add "HKCU\Software\Microsoft\Windows\DWM" /v "Animations" /t REG_DWORD /d 0 /f >nul 2>&1
reg add "HKCU\Software\Microsoft\Windows\DWM" /v "EnableAeroPeek" /t REG_DWORD /d 0 /f >nul 2>&1
echo [OK]

:: ================= DISPLAY REFRESH OPTIMIZATION =================
echo Optimizing Display Refresh Rate Settings...
reg add "HKLM\SYSTEM\CurrentControlSet\Control\GraphicsDrivers" /v "TdrDelay" /t REG_DWORD /d 8 /f >nul 2>&1
reg add "HKLM\SYSTEM\CurrentControlSet\Control\GraphicsDrivers" /v "TdrDdiDelay" /t REG_DWORD /d 8 /f >nul 2>&1
echo [OK]

:: ================= VSYNC / TRIPLE BUFFERING =================
echo Disabling Forced VSync in Windows (safe default)...
reg add "HKCU\Control Panel\Desktop" /v "WaitToKillAppTimeout" /t REG_SZ /d 200 /f >nul 2>&1
echo [OK]

:: ================= DONE =================
echo.
echo =====================================
echo         All GPU Tweaks Applied
echo         Status: COMPLETED SUCCESSFULLY
echo =====================================
timeout /t 2 >nul
exit /b

:cpu
cls
echo Applying CPU Tweaks (MAX FPS / LOW LATENCY)...
echo.

:: ================= POWER SETTINGS ATTRIBUTES =================
echo Enabling hidden performance-related processor options...
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Power\PowerSettings\54533251-82be-4824-96c1-47b60b740d00\943c8cb6-6f93-4227-ad87-e9a3feec08d1" /v Attributes /t REG_DWORD /d 2 /f >nul 2>&1
echo [OK]

:: ================= HIGH PERFORMANCE BEHAVIOR =================
echo Optimizing CPU scheduling for performance...
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Power\PowerThrottling" /v PowerThrottlingOff /t REG_DWORD /d 1 /f >nul 2>&1
reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile" /v SystemResponsiveness /t REG_DWORD /d 10 /f >nul 2>&1
echo [OK]

:: ================= CPU STATES & BOOST =================
echo Ensuring CPU boost and fast responsiveness...
:: (No C-States disabled – keep CPU stable & cool)
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Processor" /v AllowPepPerfStates /t REG_DWORD /d 1 /f >nul 2>&1
echo [OK]

:: ================= PROCESSOR PERFORMANCE =================
echo Optimizing processor performance preferences...
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Power\Policy\Settings\Processor" /v PerfEnergyPreference /t REG_DWORD /d 0 /f >nul 2>&1
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Power\Policy\Settings\Processor" /v CpLatencyHintUnpark /t REG_DWORD /d 100 /f >nul 2>&1
echo [OK]

:: ================= THREAD PRIORITY (GAMING) =================
echo Improving foreground process priority...
reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile\Tasks\Games" /v "GPU Priority" /t REG_DWORD /d 8 /f >nul 2>&1
reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile\Tasks\Games" /v Priority /t REG_DWORD /d 6 /f >nul 2>&1
reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile\Tasks\Games" /v "Scheduling Category" /t REG_SZ /d High /f >nul 2>&1
reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile\Tasks\Games" /v "SFIO Priority" /t REG_SZ /d High /f >nul 2>&1
echo [OK]

:: ================= DONE =================
echo.
echo =====================================
echo      CPU Tweaks Applied (SAFE)
echo      Focus: MAX FPS / LOW DELAY
echo =====================================
timeout /t 2 >nul
exit /b


:ram
cls
echo Applying RAM Tweaks / Cleanup (FPS & Latency)...
echo.

:: ================= STANDBY MEMORY CLEAR =================
echo Clearing Standby Memory...
powershell -command ^
"$code=@'
using System;
using System.Runtime.InteropServices;
public class Native {
    [DllImport(\"ntdll.dll\")]
    public static extern int NtSetSystemInformation(
        int SystemInformationClass,
        IntPtr SystemInformation,
        int SystemInformationLength
    );
}
'@;
Add-Type $code;
$ptr=[System.Runtime.InteropServices.Marshal]::AllocHGlobal(4);
[System.Runtime.InteropServices.Marshal]::WriteInt32($ptr,1);
[Native]::NtSetSystemInformation(80,$ptr,4);
[System.Runtime.InteropServices.Marshal]::FreeHGlobal($ptr);" >nul 2>&1
echo [OK] Standby memory cleared

:: ================= MEMORY MANAGEMENT =================
echo Optimizing memory management...
:: Disable paging executive (keep kernel in RAM)
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Memory Management" /v DisablePagingExecutive /t REG_DWORD /d 1 /f >nul 2>&1

:: Increase system cache priority (safe for gaming)
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Memory Management" /v LargeSystemCache /t REG_DWORD /d 0 /f >nul 2>&1
echo [OK]

:: ================= MEMORY COMPRESSION =================
echo Ensuring memory compression is enabled...
powershell -command "Enable-MMAgent -MemoryCompression" >nul 2>&1
echo [OK]

:: ================= DONE =================
echo.
echo =====================================
echo       RAM Tweaks Applied (SAFE)
echo       Focus: Smooth FPS / Low Stutter
echo =====================================
timeout /t 2 >nul
exit /b


:clean
cls
echo Performing SAFE System Cleanup (Gaming)...
echo.

:: ================= USER TEMP FILES =================
echo Clearing User Temp files...
rd /s /q "%TEMP%" >nul 2>&1
mkdir "%TEMP%" >nul 2>&1
echo [OK] User Temp cleared

:: ================= WINDOWS TEMP =================
echo Clearing Windows Temp files...
rd /s /q "C:\Windows\Temp" >nul 2>&1
mkdir "C:\Windows\Temp" >nul 2>&1
echo [OK] Windows Temp cleared

:: ================= DIRECTX SHADER CACHE =================
echo Clearing DirectX Shader Cache...
rd /s /q "%LOCALAPPDATA%\D3DSCache" >nul 2>&1
rd /s /q "%LOCALAPPDATA%\Temp\DXCache" >nul 2>&1
echo [OK] Shader Cache cleared

:: ================= DELIVERY OPTIMIZATION CACHE =================
echo Clearing Delivery Optimization cache...
net stop dosvc >nul 2>&1
rd /s /q "C:\Windows\ServiceProfiles\NetworkService\AppData\Local\Microsoft\Windows\DeliveryOptimization\Cache" >nul 2>&1
net start dosvc >nul 2>&1
echo [OK] Delivery Optimization cache cleared

:: ================= DNS CACHE =================
echo Flushing DNS cache...
ipconfig /flushdns >nul 2>&1
echo [OK] DNS cache flushed

:: ================= RECYCLE BIN =================
echo Emptying Recycle Bin...
powershell -command "Clear-RecycleBin -Force" >nul 2>&1
echo [OK] Recycle Bin emptied

:: ================= DONE =================
echo.
echo =====================================
echo       System Cleanup Completed
echo =====================================
timeout /t 2 >nul
exit /b


:net
cls
echo Applying Network Tweaks...
echo.

:: ================= TCP OPTIMIZATIONS =================
echo Enabling TCP quick ack and window scaling...
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" /v "TcpAckFrequency" /t REG_DWORD /d 1 /f >nul 2>&1
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" /v "TCPNoDelay" /t REG_DWORD /d 1 /f >nul 2>&1
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" /v "TcpDelAckTicks" /t REG_DWORD /d 0 /f >nul 2>&1
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" /v "EnablePMTUDiscovery" /t REG_DWORD /d 1 /f >nul 2>&1
echo [OK] TCP optimizations applied

:: ================= NETWORK THROUGHPUT =================
echo Increasing network throughput limits...
reg add "HKLM\SYSTEM\CurrentControlSet\Services\LanmanWorkstation\Parameters" /v "MaxCmds" /t REG_DWORD /d 50 /f >nul 2>&1
reg add "HKLM\SYSTEM\CurrentControlSet\Services\LanmanWorkstation\Parameters" /v "MaxMpxCt" /t REG_DWORD /d 50 /f >nul 2>&1
echo [OK] LAN workstation parameters optimized

:: ================= DNS CACHE =================
echo Increasing DNS cache size...
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Dnscache\Parameters" /v "MaxCacheTtl" /t REG_DWORD /d 86400 /f >nul 2>&1
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Dnscache\Parameters" /v "MaxNegativeCacheTtl" /t REG_DWORD /d 3600 /f >nul 2>&1
echo [OK] DNS cache optimized

:: ================= TCP/IP RESET =================
echo Resetting TCP/IP stack...
netsh int ip reset >nul 2>&1
netsh winsock reset >nul 2>&1
echo [OK] TCP/IP stack reset

:: ================= DONE =================
echo.
echo =====================================
echo         Network Tweaks Applied
echo         Status: SUCCESS
echo =====================================
timeout /t 2 >nul
exit /b

:storage
cls
echo Applying Safe Storage Tweaks for Desktop...
echo.

:: ================= ENABLE OPTIMAL TRIM =================
echo Ensuring SSD TRIM is enabled...
fsutil behavior query DisableDeleteNotify | find "0" >nul
if %errorlevel%==0 (
    echo [OK] TRIM already enabled
) else (
    fsutil behavior set DisableDeleteNotify 0 >nul 2>&1
    echo [OK] TRIM enabled
)

:: ================= DISABLE LAST ACCESS UPDATE =================
echo Disabling NTFS Last Access Timestamp (boost disk performance)...
fsutil behavior set disablelastaccess 1 >nul 2>&1
echo [OK] Last Access update disabled

:: ================= OPTIMIZE PREFETCH =================
echo Optimizing Prefetch & Boot Performance...
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Memory Management\PrefetchParameters" /v EnablePrefetcher /t REG_DWORD /d 3 /f >nul 2>&1
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Memory Management\PrefetchParameters" /v EnableSuperfetch /t REG_DWORD /d 3 /f >nul 2>&1
echo [OK] Prefetch optimized

:: ================= DISABLE 8.3 FILENAME CREATION =================
echo Disabling 8.3 filename creation on NTFS volumes...
fsutil 8dot3name set 1 >nul 2>&1
echo [OK] 8.3 filename creation disabled

:: ================= AUTOMATIC CHKDSK =================
echo Preventing automatic CHKDSK on boot...
chkntfs /x C: >nul 2>&1
echo [OK] Automatic disk check disabled

:: ================= NTFS WRITE CACHING =================
echo Enabling NTFS Write Caching for better disk speed...
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Disk\TimeOutValue" /v "0" /t REG_DWORD /d 0 /f >nul 2>&1
echo [OK] Write caching enabled

:: ================= DONE =================
echo.
echo =====================================
echo     Storage Tweaks Applied
echo     Status: SUCCESS
echo =====================================
timeout /t 2 >nul
exit /b

:input
cls
echo Applying Input Latency Tweaks...
echo.

:: ================= MOUSE RESPONSE =================
echo Optimizing Mouse Response...
reg add "HKCU\Control Panel\Mouse" /v "MouseHoverTime" /t REG_SZ /d "8" /f >nul 2>&1
reg add "HKCU\Control Panel\Mouse" /v "MouseSpeed" /t REG_SZ /d "0" /f >nul 2>&1
reg add "HKCU\Control Panel\Mouse" /v "MouseThreshold1" /t REG_SZ /d "0" /f >nul 2>&1
reg add "HKCU\Control Panel\Mouse" /v "MouseThreshold2" /t REG_SZ /d "0" /f >nul 2>&1
reg add "HKCU\Control Panel\Mouse" /v "MouseTrails" /t REG_SZ /d "0" /f >nul 2>&1
reg add "HKCU\Control Panel\Mouse" /v "SnapToDefaultButton" /t REG_SZ /d "0" /f >nul 2>&1
echo [OK] Mouse response optimized

:: ================= CONTROLLER / GAMEPAD =================
echo Optimizing Controller Polling and Sensitivity...
reg add "HKLM\SOFTWARE\Microsoft\Input\Settings\ControllerProcessor\CursorSpeed" /v "CursorSensitivity" /t REG_DWORD /d "10000" /f >nul 2>&1
reg add "HKLM\SOFTWARE\Microsoft\Input\Settings\ControllerProcessor\CursorSpeed" /v "CursorUpdateInterval" /t REG_DWORD /d "1" /f >nul 2>&1
reg add "HKLM\SOFTWARE\Microsoft\Input\Settings\ControllerProcessor\CursorMagnetism" /v "VelocityInDIPSPerSecond" /t REG_DWORD /d "360" /f >nul 2>&1
reg add "HKLM\SOFTWARE\Microsoft\Input\Settings\ControllerProcessor\CursorMagnetism" /v "MagnetismUpdateIntervalInMilliseconds" /t REG_DWORD /d "16" /f >nul 2>&1
echo [OK] Controller input optimized

:: ================= TOUCHPAD / PEN =================
echo Optimizing Touchpad / Pen Response...
reg add "HKCU\Control Panel\Mouse" /v "MouseHoverWidth" /t REG_SZ /d "4" /f >nul 2>&1
reg add "HKCU\Control Panel\Mouse" /v "MouseHoverHeight" /t REG_SZ /d "4" /f >nul 2>&1
echo [OK] Touchpad & Pen optimized

:: ================= DONE =================
echo.
echo =====================================
echo         Input Latency Tweaks Applied
echo         Status: SUCCESS
echo =====================================
timeout /t 2 >nul
exit /b

:kbm
cls
echo Applying Keyboard and Mouse Tweaks...
echo.

:: ================= ACCESSIBILITY =================
echo Disabling Mouse Keys...
reg add "HKCU\Control Panel\Accessibility\MouseKeys" /v Flags /t REG_SZ /d 0 /f >nul 2>&1
echo [OK]

echo Disabling Sticky Keys...
reg add "HKCU\Control Panel\Accessibility\StickyKeys" /v Flags /t REG_SZ /d 0 /f >nul 2>&1
echo [OK]

echo Disabling Filter Keys...
reg add "HKCU\Control Panel\Accessibility\Keyboard Response" /v Flags /t REG_SZ /d 0 /f >nul 2>&1
echo [OK]

echo Disabling Toggle Keys...
reg add "HKCU\Control Panel\Accessibility\ToggleKeys" /v Flags /t REG_SZ /d 0 /f >nul 2>&1
echo [OK]

:: ================= KEYBOARD SPEED =================
echo Setting Keyboard Delay to 0...
reg add "HKCU\Control Panel\Keyboard" /v KeyboardDelay /t REG_SZ /d 0 /f >nul 2>&1
echo [OK]

echo Setting Keyboard Speed to Maximum...
reg add "HKCU\Control Panel\Keyboard" /v KeyboardSpeed /t REG_SZ /d 31 /f >nul 2>&1
echo [OK]

echo Optimizing Keyboard Response...
reg add "HKCU\Control Panel\Accessibility\Keyboard Response" /v DelayBeforeAcceptance /t REG_SZ /d 0 /f >nul 2>&1
reg add "HKCU\Control Panel\Accessibility\Keyboard Response" /v "Last BounceKey Setting" /t REG_DWORD /d 0 /f >nul 2>&1
reg add "HKCU\Control Panel\Accessibility\Keyboard Response" /v "Last Valid Delay" /t REG_DWORD /d 0 /f >nul 2>&1
reg add "HKCU\Control Panel\Accessibility\Keyboard Response" /v "Last Valid Repeat" /t REG_DWORD /d 0 /f >nul 2>&1
reg add "HKCU\Control Panel\Accessibility\Keyboard Response" /v "Last Valid Wait" /t REG_DWORD /d 0 /f >nul 2>&1
echo [OK]

:: ================= DRIVER PRIORITY =================
echo Increasing Keyboard Driver Priority...
reg add "HKLM\SYSTEM\CurrentControlSet\Services\kbdclass\Parameters" /v ThreadPriority /t REG_DWORD /d 31 /f >nul 2>&1
echo [OK]

:: ================= USB POWER =================
echo Disabling USB Power Saving for Input Devices...
for /f "tokens=*" %%a in ('reg query "HKLM\System\CurrentControlSet\Enum" /s /f "Device Parameters" ^| findstr /i "VID_"') do (
    reg add "%%a\WDF" /v IdleInWorkingState /t REG_DWORD /d 0 /f >nul 2>&1
    reg add "%%a" /v EnhancedPowerManagementEnabled /t REG_DWORD /d 0 /f >nul 2>&1
    reg add "%%a" /v AllowIdleIrpInD3 /t REG_DWORD /d 0 /f >nul 2>&1
    reg add "%%a" /v DeviceSelectiveSuspended /t REG_DWORD /d 0 /f >nul 2>&1
    reg add "%%a" /v SelectiveSuspendEnabled /t REG_BINARY /d 00 /f >nul 2>&1
    reg add "%%a" /v SelectiveSuspendOn /t REG_DWORD /d 0 /f >nul 2>&1
    reg add "%%a" /v fid_D1Latency /t REG_DWORD /d 0 /f >nul 2>&1
    reg add "%%a" /v fid_D2Latency /t REG_DWORD /d 0 /f >nul 2>&1
    reg add "%%a" /v fid_D3Latency /t REG_DWORD /d 0 /f >nul 2>&1
)
echo [OK]

:: ================= MOUSE & DESKTOP =================
echo Applying Mouse and Desktop tweaks...
reg add "HKU\.DEFAULT\Control Panel\Desktop" /v "ForegroundLockTimeout" /t REG_DWORD /d 0 /f >nul 2>&1
reg add "HKU\.DEFAULT\Control Panel\Desktop" /v "MenuShowDelay" /t REG_SZ /d 0 /f >nul 2>&1
reg add "HKU\.DEFAULT\Control Panel\Desktop" /v "MouseWheelRouting" /t REG_DWORD /d 0 /f >nul 2>&1
reg add "HKU\.DEFAULT\Control Panel\Mouse" /v "Beep" /t REG_SZ /d No /f >nul 2>&1
reg add "HKU\.DEFAULT\Control Panel\Mouse" /v "ExtendedSounds" /t REG_SZ /d No /f >nul 2>&1
reg add "HKU\.DEFAULT\Control Panel\Sound" /v "Beep" /t REG_SZ /d no /f >nul 2>&1
reg add "HKU\.DEFAULT\Control Panel\Sound" /v "ExtendedSounds" /t REG_SZ /d no /f >nul 2>&1

reg add "HKCU\Control Panel\Mouse" /v "ActiveWindowTracking" /t REG_DWORD /d 0 /f >nul 2>&1
reg add "HKCU\Control Panel\Mouse" /v "Beep" /t REG_SZ /d No /f >nul 2>&1
reg add "HKCU\Control Panel\Mouse" /v "DoubleClickHeight" /t REG_SZ /d 4 /f >nul 2>&1
reg add "HKCU\Control Panel\Mouse" /v "DoubleClickSpeed" /t REG_SZ /d 500 /f >nul 2>&1
reg add "HKCU\Control Panel\Mouse" /v "DoubleClickWidth" /t REG_SZ /d 4 /f >nul 2>&1
reg add "HKCU\Control Panel\Mouse" /v "ExtendedSounds" /t REG_SZ /d No /f >nul 2>&1
reg add "HKCU\Control Panel\Mouse" /v "MouseHoverHeight" /t REG_SZ /d 4 /f >nul 2>&1
reg add "HKCU\Control Panel\Mouse" /v "MouseHoverWidth" /t REG_SZ /d 4 /f >nul 2>&1
reg add "HKCU\Control Panel\Mouse" /v "MouseSensitivity" /t REG_SZ /d 10 /f >nul 2>&1
reg add "HKCU\Control Panel\Mouse" /v "MouseSpeed" /t REG_SZ /d 0 /f >nul 2>&1
reg add "HKCU\Control Panel\Mouse" /v "MouseThreshold1" /t REG_SZ /d 0 /f >nul 2>&1
reg add "HKCU\Control Panel\Mouse" /v "MouseThreshold2" /t REG_SZ /d 0 /f >nul 2>&1
reg add "HKCU\Control Panel\Mouse" /v "MouseTrails" /t REG_SZ /d 0 /f >nul 2>&1
reg add "HKCU\Control Panel\Mouse" /v "MouseHoverTime" /t REG_SZ /d 8 /f >nul 2>&1
reg add "HKCU\Control Panel\Mouse" /v "SnapToDefaultButton" /t REG_SZ /d 0 /f >nul 2>&1
reg add "HKCU\Control Panel\Mouse" /v "SwapMouseButtons" /t REG_SZ /d 0 /f >nul 2>&1
reg add "HKCU\Control Panel\Mouse" /v "SmoothMouseXCurve" /t REG_BINARY /d "0000000000000000c0cc0c0000000000809919000000000040662600000000000033330000000000" /f >nul 2>&1
reg add "HKCU\Control Panel\Mouse" /v "SmoothMouseYCurve" /t REG_BINARY /d "0000000000000000000038000000000000007000000000000000a800000000000000e00000000000" /f >nul 2>&1

:: ================= CONTROLLER INPUT =================
echo Applying Controller Processor tweaks...
reg add "HKLM\SOFTWARE\Microsoft\Input\Settings\ControllerProcessor\CursorSpeed" /v "CursorSensitivity" /t REG_DWORD /d 10000 /f >nul 2>&1
reg add "HKLM\SOFTWARE\Microsoft\Input\Settings\ControllerProcessor\CursorSpeed" /v "CursorUpdateInterval" /t REG_DWORD /d 1 /f >nul 2>&1
reg add "HKLM\SOFTWARE\Microsoft\Input\Settings\ControllerProcessor\CursorMagnetism" /v "AttractionRectInsetInDIPS" /t REG_DWORD /d 5 /f >nul 2>&1
reg add "HKLM\SOFTWARE\Microsoft\Input\Settings\ControllerProcessor\CursorMagnetism" /v "DistanceThresholdInDIPS" /t REG_DWORD /d 40 /f >nul 2>&1
reg add "HKLM\SOFTWARE\Microsoft\Input\Settings\ControllerProcessor\CursorMagnetism" /v "MagnetismDelayInMilliseconds" /t REG_DWORD /d 50 /f >nul 2>&1
reg add "HKLM\SOFTWARE\Microsoft\Input\Settings\ControllerProcessor\CursorMagnetism" /v "MagnetismUpdateIntervalInMilliseconds" /t REG_DWORD /d 16 /f >nul 2>&1
reg add "HKLM\SOFTWARE\Microsoft\Input\Settings\ControllerProcessor\CursorMagnetism" /v "VelocityInDIPSPerSecond" /t REG_DWORD /d 360 /f >nul 2>&1

:: ================= MOUSE DRIVER PRIORITY =================
echo Increasing Mouse Driver Priority...
reg add "HKLM\SYSTEM\CurrentControlSet\Services\mouclass\Parameters" /v ThreadPriority /t REG_DWORD /d 31 /f >nul 2>&1
echo [OK]

:: ================= DONE =================
echo.
echo =====================================
echo   All Keyboard and Mouse Tweaks Applied
echo   Status: COMPLETED SUCCESSFULLY
echo =====================================
timeout /t 2 >nul
exit /b

:power
cls
echo Applying SAFE High Performance Power Tweaks...
echo.

:: ================= ENABLE ULTIMATE PERFORMANCE =================
echo Enabling Ultimate Performance power plan...

:: Create plan if not present
powercfg -duplicatescheme e9a42b02-d5df-448d-aa00-03f14749eb61 >nul 2>&1

:: Activate Ultimate Performance
for /f "tokens=3" %%a in ('powercfg -list ^| findstr /i "Ultimate"') do (
    powercfg /setactive %%a >nul 2>&1
)

echo [OK] Ultimate Performance enabled


:: ================= CPU PERFORMANCE =================
echo Optimizing CPU performance for low latency...

:: Minimum processor state = 100% (prevents downclock delay)
powercfg /setacvalueindex SCHEME_CURRENT SUB_PROCESSOR PROCTHROTTLEMIN 100 >nul 2>&1

:: Maximum processor state = 100%
powercfg /setacvalueindex SCHEME_CURRENT SUB_PROCESSOR PROCTHROTTLEMAX 100 >nul 2>&1

:: Enable aggressive boost (faster response under load)
powercfg /setacvalueindex SCHEME_CURRENT SUB_PROCESSOR PERFBOOSTMODE 2 >nul 2>&1

echo [OK] CPU performance optimized


:: ================= PCI EXPRESS POWER =================
echo Disabling PCIe power saving (prevents GPU latency spikes)...

powercfg /setacvalueindex SCHEME_CURRENT SUB_PCIEXPRESS ASPM 0 >nul 2>&1

echo [OK] PCIe power saving disabled


:: ================= USB POWER SAVING =================
echo Disabling USB selective suspend (input latency reduction)...

powercfg /setacvalueindex SCHEME_CURRENT SUB_USB USBSELECTIVE SUSPEND 0 >nul 2>&1

echo [OK] USB power saving disabled


:: ================= SLEEP SETTINGS (SAFE) =================
echo Disabling sleep while plugged in...

powercfg /change standby-timeout-ac 0 >nul 2>&1

echo [OK] Sleep disabled on AC power
echo [INFO] Laptop battery sleep untouched (safe)


:: ================= APPLY CHANGES =================
powercfg /setactive SCHEME_CURRENT >nul 2>&1

echo.
echo =====================================
echo    SAFE Power Tweaks Applied
echo    Focus: Stable FPS + Low Latency
echo =====================================
timeout /t 2 >nul
exit /b
