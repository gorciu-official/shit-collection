net session >nul 2>&1

if %errorLevel% == 0 (
    set "PATH=%PATH%;%~dp0"
) else (
    echo Fatal error: the script does not have the admin permissions.
)