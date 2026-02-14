# Internal filename: 'Fortnite_Optimizer.py'
# Bytecode version: 3.14rc3 (3627)
# Source timestamp: 1970-01-01 00:00:00 UTC (0)

import os
import sys
import ctypes
import subprocess
import winreg
import time
def is_admin():
    # irreducible cflow, using cdg fallback
    # ***<module>.is_admin: Failure: Different control flow
    return ctypes.windll.shell32.IsUserAnAdmin()
def run_as_admin():
    if not is_admin():
        ctypes.windll.shell32.ShellExecuteW(None, 'runas', sys.executable, ' '.join(sys.argv), None, 1)
        sys.exit()
def set_r(h, p, n, v, t=winreg.REG_DWORD):
    try:
        k = winreg.CreateKeyEx(h, p, 0, winreg.KEY_SET_VALUE)
        winreg.SetValueEx(k, n, 0, t, v)
        winreg.CloseKey(k)
    except:
        return None
def step(text, d=0.4):
    print(f'[*] {text.ljust(45)}', end='', flush=True)
    for _ in range(10):
        time.sleep(d / 10)
        print('■', end='', flush=True)
    print(' [DONE]')
def extreme_input_lag_v4():
    print('\n[PHASE 1: ZERO DELAY ENGINE]')
    step('BCDEdit Kernel Timer (0.5ms Focus)', 0.8)
    os.system('bcdedit /set disabledynamictick yes >nul 2>&1')
    os.system('bcdedit /set useplatformtick yes >nul 2>&1')
    os.system('bcdedit /deletevalue useplatformclock >nul 2>&1')
    step('Win32Priority & IRQ Optimization', 0.5)
    set_r(winreg.HKEY_LOCAL_MACHINE, 'SYSTEM\\CurrentControlSet\\Control\\PriorityControl', 'Win32PrioritySeparation', 38)
    set_r(winreg.HKEY_LOCAL_MACHINE, 'SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile', 'SystemResponsiveness', 0)
    step('Keyboard/Mouse Buffer Optimization', 0.6)
    set_r(winreg.HKEY_LOCAL_MACHINE, 'SYSTEM\\CurrentControlSet\\Services\\mouclass\\Parameters', 'MouseDataQueueSize', 16)
    set_r(winreg.HKEY_LOCAL_MACHINE, 'SYSTEM\\CurrentControlSet\\Services\\kbdclass\\Parameters', 'KeyboardDataQueueSize', 16)
    set_r(winreg.HKEY_CURRENT_USER, 'Control Panel\\Mouse', 'MouseSpeed', '0', winreg.REG_SZ)
def extreme_ping_v4():
    print('\n[PHASE 2: PING OPTIMIZER]')
    step('TCP/IP NoDelay (Nagle\'s Kill)', 1.0)
    ps_net = 'Get-ChildItem \'HKLM:\\SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters\\Interfaces\' | ForEach-Object { New-ItemProperty -Path $_.PSPath -Name \'TcpAckFrequency\' -Value 1 -PropertyType DWord -Force; New-ItemProperty -Path $_.PSPath -Name \'TCPNoDelay\' -Value 1 -PropertyType DWord -Force; New-ItemProperty -Path $_.PSPath -Name \'TcpDelAckTicks\' -Value 0 -PropertyType DWord -Force }'
    subprocess.run(f'powershell -Command \"{ps_net}\"', shell=True, capture_output=True)
    step('Removing Network Throttling & QoS', 0.7)
    set_r(winreg.HKEY_LOCAL_MACHINE, 'SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile', 'NetworkThrottlingIndex', 4294967295)
    set_r(winreg.HKEY_LOCAL_MACHINE, 'SOFTWARE\\Policies\\Microsoft\\Windows\\Psched', 'NonBestEffortLimit', 0)
    step('Netsh TCP Stack Hardening', 0.8)
    os.system('netsh int tcp set global autotuninglevel=disabled >nul 2>&1')
    os.system('netsh int tcp set global rss=enabled >nul 2>&1')
    os.system('netsh int tcp set global fastopen=enabled >nul 2>&1')
    os.system('netsh int tcp set global ecncapability=enabled >nul 2>&1')
def performance_system_v4():
    print('\n[PHASE 3: SYSTEM CLEANUP & FPS STABILITY]')
    step('Terminating Latency Services', 0.5)
    svcs = ['DiagTrack', 'SysMain', 'WSearch', 'OneSyncSvc', 'RemoteRegistry', 'XblAuthManager', 'XblGameSave', 'MapsBroker']
    for s in svcs:
        os.system(f'sc stop {s} >nul 2>&1 && sc config {s} start= disabled >nul 2>&1')
    step('Inicjacja Ultimate Power Plan', 0.4)
    os.system('powercfg -duplicatescheme e9a42b02-d5df-448d-aa00-03f14749eb61 >nul 2>&1')
    os.system('powercfg -setactive e9a42b02-d5df-448d-aa00-03f14749eb61 >nul 2>&1')
    step('Clearing Cache & DNS Stack', 0.6)
    os.system('del /q /f /s %temp%\\* >nul 2>&1')
    os.system('ipconfig /flushdns >nul 2>&1')
def menu():
    # irreducible cflow, using cdg fallback
    # ***<module>.menu: Failure: Compilation Error
    os.system('cls')
    os.system('color 0B')
    print('\n            =======================================================\n                 FORTNITE ZERO DELAY & LOW PING OPTIMIZER\n            =======================================================\n            [1] Stworz punkt przywracania\n            [2] Zero Delay (Input Lag)\n            [3] Fortnite Ping Optimization\n            [4] CALA OPTYMALIZACJA (MAX PERFORMANCE)\n            \n            [5] Przywrocenie systemu (Recovery)\n            [6] Wyjscie\n            =======================================================')
    choice = input('>> Wybierz opcje: ')
    if choice == '1':
        pass
    step('Tworzenie punktu przywracania', 2.0)
    subprocess.run('powershell -Command \"Enable-ComputerRestore -Drive \'C:\'; Checkpoint-Computer -Description \'V4_Opt_Backup\' -RestorePointType MODIFY_SETTINGS\"', shell=True)
    if choice == '2':
        pass
    extreme_input_lag_v4()
    if choice == '3':
        pass
    extreme_ping_v4()
    if choice == '4':
        pass
    extreme_input_lag_v4()
    extreme_ping_v4()
    performance_system_v4()
    if choice == '5':
        pass
    os.system('rstrui.exe')
    if choice == '6':
        pass
    return
    print('\n[!] GOTOWE. Zrestartuj komputer dla pelnego efektu.')
    input('Nacisnij Enter, aby kontynuowac...')
    except EOFError:
        pass
    return None
if __name__ == '__main__':
    ctypes.windll.kernel32.SetConsoleTitleW('Zero Delay & Low Ping 2026')
    run_as_admin()
    menu()
