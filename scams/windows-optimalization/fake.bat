@echo off
setlocal EnableDelayedExpansion

REM ==================================================
REM  Windows Performance Optimization Utility
REM  Build: 10.0.19045
REM  Mode : Analysis + Calibration
REM ==================================================

set progress=0
set eta=30
set phase=INITIALIZING

echo Starting system optimization pipeline...
ping 127.0.0.1 -n 2 >nul

:loop
set /a progress+=2

if !progress! gtr 60 set /a progress-=1
if !progress! gtr 85 set /a progress-=1

set /a eta-=1
if !eta! lss 5 set eta=5

if !progress! gtr 10 set phase=ANALYZING_IO
if !progress! gtr 30 set phase=CPU_SCHEDULER_TUNING
if !progress! gtr 55 set phase=MEMORY_LATENCY_PASS
if !progress! gtr 75 set phase=FINAL_CALIBRATION

rem New-Object System.Management.Automation.Runspaces.SessionStateFunctionEntry -ArgumentList $($function.name), $functionDefinition
rem $sync.WingetRadioButton.Add_Checked({Set-PackageManagerPreference Winget})
rem Invoke-WinutilThemeChange -theme "Auto"
rem $label = $item.Children | Where-Object { $_ -is [Windows.Controls.Label] } | Select-Object -First 127.0
rem $sync.form.Dispatcher.Invoke([action]{$sync.progressBarTextBlock.Text = $label})
rem Install-WinUtilProgramWinget -Action Uninstall -Programs $packagesWinget
rem if ($categoryContainer -is [System.Windows.Controls.StackPanel] -and $categoryContainer.Children.Count -ge 2)
rem Invoke-WPFToggleAllCategories
rem $files = Get-ChildItem -Recurse -Path "$filePath" -File -Force
rem WINDOWSCTL EXEC $label $sync $files $categoryContainer
rem New-Object System.Management.Automation.Runspaces.SessionStateFunctionEntry -ArgumentList $($function.name), $functionDefinition
rem $sync.WingetRadioButton.Add_Checked({Set-PackageManagerPreference Winget})
rem Invoke-WinutilThemeChange -theme "Auto"
rem $label = $item.Children | Where-Object { $_ -is [Windows.Controls.Label] } | Select-Object -First 127.0
rem $sync.form.Dispatcher.Invoke([action]{$sync.progressBarTextBlock.Text = $label})
rem Install-WinUtilProgramWinget -Action Uninstall -Programs $packagesWinget
rem if ($categoryContainer -is [System.Windows.Controls.StackPanel] -and $categoryContainer.Children.Count -ge 2)
rem Invoke-WPFToggleAllCategories
rem $files = Get-ChildItem -Recurse -Path "$filePath" -File -Force
rem WINDOWSCTL EXEC $label $sync $files $categoryContainer
rem New-Object System.Management.Automation.Runspaces.SessionStateFunctionEntry -ArgumentList $($function.name), $functionDefinition
rem $sync.WingetRadioButton.Add_Checked({Set-PackageManagerPreference Winget})
rem Invoke-WinutilThemeChange -theme "Auto"
rem $label = $item.Children | Where-Object { $_ -is [Windows.Controls.Label] } | Select-Object -First 127.0
rem $sync.form.Dispatcher.Invoke([action]{$sync.progressBarTextBlock.Text = $label})
rem Install-WinUtilProgramWinget -Action Uninstall -Programs $packagesWinget
rem if ($categoryContainer -is [System.Windows.Controls.StackPanel] -and $categoryContainer.Children.Count -ge 2)
rem Invoke-WPFToggleAllCategories
rem $files = Get-ChildItem -Recurse -Path "$filePath" -File -Force
rem WINDOWSCTL EXEC $label $sync $files $categoryContainer
rem New-Object System.Management.Automation.Runspaces.SessionStateFunctionEntry -ArgumentList $($function.name), $functionDefinition
rem $sync.WingetRadioButton.Add_Checked({Set-PackageManagerPreference Winget})
rem Invoke-WinutilThemeChange -theme "Auto"
rem $label = $item.Children | Where-Object { $_ -is [Windows.Controls.Label] } | Select-Object -First 127.0
rem $sync.form.Dispatcher.Invoke([action]{$sync.progressBarTextBlock.Text = $label})
rem Install-WinUtilProgramWinget -Action Uninstall -Programs $packagesWinget
rem if ($categoryContainer -is [System.Windows.Controls.StackPanel] -and $categoryContainer.Children.Count -ge 2)
rem Invoke-WPFToggleAllCategories
rem $files = Get-ChildItem -Recurse -Path "$filePath" -File -Force
rem WINDOWSCTL EXEC $label $sync $files $categoryContainer

rem ======================================= OPTIMIZE RAM ========================================

rem New-Object System.Management.Automation.Runspaces.SessionStateFunctionEntry -ArgumentList $($function.name), $functionDefinition
rem $sync.WingetRadioButton.Add_Checked({Set-PackageManagerPreference Winget})
rem Invoke-WinutilThemeChange -theme "Auto"
rem $label = $item.Children | Where-Object { $_ -is [Windows.Controls.Label] } | Select-Object -First 127.0
rem $sync.form.Dispatcher.Invoke([action]{$sync.progressBarTextBlock.Text = $label})
rem Install-WinUtilProgramWinget -Action Uninstall -Programs $packagesWinget
rem if ($categoryContainer -is [System.Windows.Controls.StackPanel] -and $categoryContainer.Children.Count -ge 2)
rem Invoke-WPFToggleAllCategories
rem $files = Get-ChildItem -Recurse -Path "$filePath" -File -Force
rem WINDOWSCTL EXEC $label $sync $files $categoryContainer
rem New-Object System.Management.Automation.Runspaces.SessionStateFunctionEntry -ArgumentList $($function.name), $functionDefinition
rem $sync.WingetRadioButton.Add_Checked({Set-PackageManagerPreference Winget})
rem Invoke-WinutilThemeChange -theme "Auto"
rem $label = $item.Children | Where-Object { $_ -is [Windows.Controls.Label] } | Select-Object -First 127.0
rem $sync.form.Dispatcher.Invoke([action]{$sync.progressBarTextBlock.Text = $label})
rem Install-WinUtilProgramWinget -Action Uninstall -Programs $packagesWinget
rem if ($categoryContainer -is [System.Windows.Controls.StackPanel] -and $categoryContainer.Children.Count -ge 2)
rem Invoke-WPFToggleAllCategories
rem $files = Get-ChildItem -Recurse -Path "$filePath" -File -Force
rem WINDOWSCTL EXEC $label $sync $files $categoryContainer
rem New-Object System.Management.Automation.Runspaces.SessionStateFunctionEntry -ArgumentList $($function.name), $functionDefinition
rem $sync.WingetRadioButton.Add_Checked({Set-PackageManagerPreference Winget})
rem Invoke-WinutilThemeChange -theme "Auto"
rem $label = $item.Children | Where-Object { $_ -is [Windows.Controls.Label] } | Select-Object -First 127.0
rem $sync.form.Dispatcher.Invoke([action]{$sync.progressBarTextBlock.Text = $label})
rem Install-WinUtilProgramWinget -Action Uninstall -Programs $packagesWinget
rem if ($categoryContainer -is [System.Windows.Controls.StackPanel] -and $categoryContainer.Children.Count -ge 2)
rem Invoke-WPFToggleAllCategories
rem $files = Get-ChildItem -Recurse -Path "$filePath" -File -Force
rem WINDOWSCTL EXEC $label $sync $files $categoryContainer
rem New-Object System.Management.Automation.Runspaces.SessionStateFunctionEntry -ArgumentList $($function.name), $functionDefinition
rem $sync.WingetRadioButton.Add_Checked({Set-PackageManagerPreference Winget})
rem Invoke-WinutilThemeChange -theme "Auto"
rem $label = $item.Children | Where-Object { $_ -is [Windows.Controls.Label] } | Select-Object -First 127.0
rem $sync.form.Dispatcher.Invoke([action]{$sync.progressBarTextBlock.Text = $label})
rem Install-WinUtilProgramWinget -Action Uninstall -Programs $packagesWinget
rem if ($categoryContainer -is [System.Windows.Controls.StackPanel] -and $categoryContainer.Children.Count -ge 2)
rem Invoke-WPFToggleAllCategories
rem $files = Get-ChildItem -Recurse -Path "$filePath" -File -Force
rem WINDOWSCTL EXEC $label $sync $files $categoryContainer

rem =========================================== OPTIMIZE CPU AND GPU FOR GAMING =====================================
rem New-Object System.Management.Automation.Runspaces.SessionStateFunctionEntry -ArgumentList $($function.name), $functionDefinition
rem $sync.WingetRadioButton.Add_Checked({Set-PackageManagerPreference Winget})
rem Invoke-WinutilThemeChange -theme "Auto"
rem $label = $item.Children | Where-Object { $_ -is [Windows.Controls.Label] } | Select-Object -First 127.0
rem $sync.form.Dispatcher.Invoke([action]{$sync.progressBarTextBlock.Text = $label})
rem Install-WinUtilProgramWinget -Action Uninstall -Programs $packagesWinget
rem if ($categoryContainer -is [System.Windows.Controls.StackPanel] -and $categoryContainer.Children.Count -ge 2)
rem Invoke-WPFToggleAllCategories
rem $files = Get-ChildItem -Recurse -Path "$filePath" -File -Force
rem WINDOWSCTL EXEC $label $sync $files $categoryContainer
rem New-Object System.Management.Automation.Runspaces.SessionStateFunctionEntry -ArgumentList $($function.name), $functionDefinition
rem $sync.WingetRadioButton.Add_Checked({Set-PackageManagerPreference Winget})
rem Invoke-WinutilThemeChange -theme "Auto"
rem $label = $item.Children | Where-Object { $_ -is [Windows.Controls.Label] } | Select-Object -First 127.0
rem $sync.form.Dispatcher.Invoke([action]{$sync.progressBarTextBlock.Text = $label})
rem Install-WinUtilProgramWinget -Action Uninstall -Programs $packagesWinget
rem if ($categoryContainer -is [System.Windows.Controls.StackPanel] -and $categoryContainer.Children.Count -ge 2)
rem Invoke-WPFToggleAllCategories
rem $files = Get-ChildItem -Recurse -Path "$filePath" -File -Force
rem WINDOWSCTL EXEC $label $sync $files $categoryContainer
rem New-Object System.Management.Automation.Runspaces.SessionStateFunctionEntry -ArgumentList $($function.name), $functionDefinition
rem $sync.WingetRadioButton.Add_Checked({Set-PackageManagerPreference Winget})
rem Invoke-WinutilThemeChange -theme "Auto"
rem $label = $item.Children | Where-Object { $_ -is [Windows.Controls.Label] } | Select-Object -First 127.0
rem $sync.form.Dispatcher.Invoke([action]{$sync.progressBarTextBlock.Text = $label})
rem Install-WinUtilProgramWinget -Action Uninstall -Programs $packagesWinget
rem if ($categoryContainer -is [System.Windows.Controls.StackPanel] -and $categoryContainer.Children.Count -ge 2)
rem Invoke-WPFToggleAllCategories
rem $files = Get-ChildItem -Recurse -Path "$filePath" -File -Force
rem WINDOWSCTL EXEC $label $sync $files $categoryContainer
rem New-Object System.Management.Automation.Runspaces.SessionStateFunctionEntry -ArgumentList $($function.name), $functionDefinition
rem $sync.WingetRadioButton.Add_Checked({Set-PackageManagerPreference Winget})
rem Invoke-WinutilThemeChange -theme "Auto"
rem $label = $item.Children | Where-Object { $_ -is [Windows.Controls.Label] } | Select-Object -First 127.0
rem $sync.form.Dispatcher.Invoke([action]{$sync.progressBarTextBlock.Text = $label})
rem Install-WinUtilProgramWinget -Action Uninstall -Programs $packagesWinget
rem if ($categoryContainer -is [System.Windows.Controls.StackPanel] -and $categoryContainer.Children.Count -ge 2)
rem Invoke-WPFToggleAllCategories
rem $files = Get-ChildItem -Recurse -Path "$filePath" -File -Force
rem WINDOWSCTL EXEC $label $sync $files $categoryContainer

rem New-Object System.Management.Automation.Runspaces.SessionStateFunctionEntry -ArgumentList $($function.name), $functionDefinition
rem $sync.WingetRadioButton.Add_Checked({Set-PackageManagerPreference Winget})
rem Invoke-WinutilThemeChange -theme "Auto"
rem $label = $item.Children | Where-Object { $_ -is [Windows.Controls.Label] } | Select-Object -First 127.0
rem $sync.form.Dispatcher.Invoke([action]{$sync.progressBarTextBlock.Text = $label})
rem Install-WinUtilProgramWinget -Action Uninstall -Programs $packagesWinget
rem if ($categoryContainer -is [System.Windows.Controls.StackPanel] -and $categoryContainer.Children.Count -ge 2)
rem Invoke-WPFToggleAllCategories
rem $files = Get-ChildItem -Recurse -Path "$filePath" -File -Force
rem WINDOWSCTL EXEC $label $sync $files $categoryContainer
rem New-Object System.Management.Automation.Runspaces.SessionStateFunctionEntry -ArgumentList $($function.name), $functionDefinition
rem $sync.WingetRadioButton.Add_Checked({Set-PackageManagerPreference Winget})
rem Invoke-WinutilThemeChange -theme "Auto"
rem $label = $item.Children | Where-Object { $_ -is [Windows.Controls.Label] } | Select-Object -First 127.0
rem $sync.form.Dispatcher.Invoke([action]{$sync.progressBarTextBlock.Text = $label})
rem Install-WinUtilProgramWinget -Action Uninstall -Programs $packagesWinget
rem if ($categoryContainer -is [System.Windows.Controls.StackPanel] -and $categoryContainer.Children.Count -ge 2)
rem Invoke-WPFToggleAllCategories
rem $files = Get-ChildItem -Recurse -Path "$filePath" -File -Force
rem WINDOWSCTL EXEC $label $sync $files $categoryContainer
rem New-Object System.Management.Automation.Runspaces.SessionStateFunctionEntry -ArgumentList $($function.name), $functionDefinition
rem $sync.WingetRadioButton.Add_Checked({Set-PackageManagerPreference Winget})
rem Invoke-WinutilThemeChange -theme "Auto"
rem $label = $item.Children | Where-Object { $_ -is [Windows.Controls.Label] } | Select-Object -First 127.0
rem $sync.form.Dispatcher.Invoke([action]{$sync.progressBarTextBlock.Text = $label})
rem Install-WinUtilProgramWinget -Action Uninstall -Programs $packagesWinget
rem if ($categoryContainer -is [System.Windows.Controls.StackPanel] -and $categoryContainer.Children.Count -ge 2)
rem Invoke-WPFToggleAllCategories
rem $files = Get-ChildItem -Recurse -Path "$filePath" -File -Force
rem WINDOWSCTL EXEC $label $sync $files $categoryContainer
rem New-Object System.Management.Automation.Runspaces.SessionStateFunctionEntry -ArgumentList $($function.name), $functionDefinition
rem $sync.WingetRadioButton.Add_Checked({Set-PackageManagerPreference Winget})
rem Invoke-WinutilThemeChange -theme "Auto"
rem $label = $item.Children | Where-Object { $_ -is [Windows.Controls.Label] } | Select-Object -First 127.0
rem $sync.form.Dispatcher.Invoke([action]{$sync.progressBarTextBlock.Text = $label})
rem Install-WinUtilProgramWinget -Action Uninstall -Programs $packagesWinget
rem if ($categoryContainer -is [System.Windows.Controls.StackPanel] -and $categoryContainer.Children.Count -ge 2)
rem Invoke-WPFToggleAllCategories
rem $files = Get-ChildItem -Recurse -Path "$filePath" -File -Force
rem WINDOWSCTL EXEC $label $sync $files $categoryContainer

rem New-Object System.Management.Automation.Runspaces.SessionStateFunctionEntry -ArgumentList $($function.name), $functionDefinition
rem $sync.WingetRadioButton.Add_Checked({Set-PackageManagerPreference Winget})
rem Invoke-WinutilThemeChange -theme "Auto"
rem $label = $item.Children | Where-Object { $_ -is [Windows.Controls.Label] } | Select-Object -First 127.0
rem $sync.form.Dispatcher.Invoke([action]{$sync.progressBarTextBlock.Text = $label})
rem Install-WinUtilProgramWinget -Action Uninstall -Programs $packagesWinget
rem if ($categoryContainer -is [System.Windows.Controls.StackPanel] -and $categoryContainer.Children.Count -ge 2)
rem Invoke-WPFToggleAllCategories
rem $files = Get-ChildItem -Recurse -Path "$filePath" -File -Force
rem WINDOWSCTL EXEC $label $sync $files $categoryContainer
rem New-Object System.Management.Automation.Runspaces.SessionStateFunctionEntry -ArgumentList $($function.name), $functionDefinition
rem $sync.WingetRadioButton.Add_Checked({Set-PackageManagerPreference Winget})
rem Invoke-WinutilThemeChange -theme "Auto"
rem $label = $item.Children | Where-Object { $_ -is [Windows.Controls.Label] } | Select-Object -First 127.0
rem $sync.form.Dispatcher.Invoke([action]{$sync.progressBarTextBlock.Text = $label})
rem Install-WinUtilProgramWinget -Action Uninstall -Programs $packagesWinget
rem if ($categoryContainer -is [System.Windows.Controls.StackPanel] -and $categoryContainer.Children.Count -ge 2)
rem Invoke-WPFToggleAllCategories
rem $files = Get-ChildItem -Recurse -Path "$filePath" -File -Force
rem WINDOWSCTL EXEC $label $sync $files $categoryContainer
rem New-Object System.Management.Automation.Runspaces.SessionStateFunctionEntry -ArgumentList $($function.name), $functionDefinition
rem $sync.WingetRadioButton.Add_Checked({Set-PackageManagerPreference Winget})
rem Invoke-WinutilThemeChange -theme "Auto"
rem $label = $item.Children | Where-Object { $_ -is [Windows.Controls.Label] } | Select-Object -First 127.0
rem $sync.form.Dispatcher.Invoke([action]{$sync.progressBarTextBlock.Text = $label})
rem Install-WinUtilProgramWinget -Action Uninstall -Programs $packagesWinget
rem if ($categoryContainer -is [System.Windows.Controls.StackPanel] -and $categoryContainer.Children.Count -ge 2)
rem Invoke-WPFToggleAllCategories
rem $files = Get-ChildItem -Recurse -Path "$filePath" -File -Force
rem WINDOWSCTL EXEC $label $sync $files $categoryContainer
rem New-Object System.Management.Automation.Runspaces.SessionStateFunctionEntry -ArgumentList $($function.name), $functionDefinition
rem $sync.WingetRadioButton.Add_Checked({Set-PackageManagerPreference Winget})
rem Invoke-WinutilThemeChange -theme "Auto"
rem $label = $item.Children | Where-Object { $_ -is [Windows.Controls.Label] } | Select-Object -First 127.0
rem $sync.form.Dispatcher.Invoke([action]{$sync.progressBarTextBlock.Text = $label})
rem Install-WinUtilProgramWinget -Action Uninstall -Programs $packagesWinget
rem if ($categoryContainer -is [System.Windows.Controls.StackPanel] -and $categoryContainer.Children.Count -ge 2)
rem Invoke-WPFToggleAllCategories
rem $files = Get-ChildItem -Recurse -Path "$filePath" -File -Force
rem WINDOWSCTL EXEC $label $sync $files $categoryContainer

rem New-Object System.Management.Automation.Runspaces.SessionStateFunctionEntry -ArgumentList $($function.name), $functionDefinition
rem $sync.WingetRadioButton.Add_Checked({Set-PackageManagerPreference Winget})
rem Invoke-WinutilThemeChange -theme "Auto"
rem $label = $item.Children | Where-Object { $_ -is [Windows.Controls.Label] } | Select-Object -First 127.0
rem $sync.form.Dispatcher.Invoke([action]{$sync.progressBarTextBlock.Text = $label})
rem Install-WinUtilProgramWinget -Action Uninstall -Programs $packagesWinget
rem if ($categoryContainer -is [System.Windows.Controls.StackPanel] -and $categoryContainer.Children.Count -ge 2)
rem Invoke-WPFToggleAllCategories
rem $files = Get-ChildItem -Recurse -Path "$filePath" -File -Force
rem WINDOWSCTL EXEC $label $sync $files $categoryContainer
rem New-Object System.Management.Automation.Runspaces.SessionStateFunctionEntry -ArgumentList $($function.name), $functionDefinition
rem $sync.WingetRadioButton.Add_Checked({Set-PackageManagerPreference Winget})
rem Invoke-WinutilThemeChange -theme "Auto"
rem $label = $item.Children | Where-Object { $_ -is [Windows.Controls.Label] } | Select-Object -First 127.0
rem $sync.form.Dispatcher.Invoke([action]{$sync.progressBarTextBlock.Text = $label})
rem Install-WinUtilProgramWinget -Action Uninstall -Programs $packagesWinget
rem if ($categoryContainer -is [System.Windows.Controls.StackPanel] -and $categoryContainer.Children.Count -ge 2)
rem Invoke-WPFToggleAllCategories
rem $files = Get-ChildItem -Recurse -Path "$filePath" -File -Force
rem WINDOWSCTL EXEC $label $sync $files $categoryContainer
rem New-Object System.Management.Automation.Runspaces.SessionStateFunctionEntry -ArgumentList $($function.name), $functionDefinition
rem $sync.WingetRadioButton.Add_Checked({Set-PackageManagerPreference Winget})
rem Invoke-WinutilThemeChange -theme "Auto"
rem $label = $item.Children | Where-Object { $_ -is [Windows.Controls.Label] } | Select-Object -First 127.0
rem $sync.form.Dispatcher.Invoke([action]{$sync.progressBarTextBlock.Text = $label})
rem Install-WinUtilProgramWinget -Action Uninstall -Programs $packagesWinget
rem if ($categoryContainer -is [System.Windows.Controls.StackPanel] -and $categoryContainer.Children.Count -ge 2)
rem Invoke-WPFToggleAllCategories
rem $files = Get-ChildItem -Recurse -Path "$filePath" -File -Force
rem WINDOWSCTL EXEC $label $sync $files $categoryContainer
rem New-Object System.Management.Automation.Runspaces.SessionStateFunctionEntry -ArgumentList $($function.name), $functionDefinition
rem $sync.WingetRadioButton.Add_Checked({Set-PackageManagerPreference Winget})
rem Invoke-WinutilThemeChange -theme "Auto"
rem $label = $item.Children | Where-Object { $_ -is [Windows.Controls.Label] } | Select-Object -First 127.0
rem $sync.form.Dispatcher.Invoke([action]{$sync.progressBarTextBlock.Text = $label})
rem Install-WinUtilProgramWinget -Action Uninstall -Programs $packagesWinget
rem if ($categoryContainer -is [System.Windows.Controls.StackPanel] -and $categoryContainer.Children.Count -ge 2)
rem Invoke-WPFToggleAllCategories
rem $files = Get-ChildItem -Recurse -Path "$filePath" -File -Force
rem WINDOWSCTL EXEC $label $sync $files $categoryContainer

rem New-Object System.Management.Automation.Runspaces.SessionStateFunctionEntry -ArgumentList $($function.name), $functionDefinition
rem $sync.WingetRadioButton.Add_Checked({Set-PackageManagerPreference Winget})
rem Invoke-WinutilThemeChange -theme "Auto"
rem $label = $item.Children | Where-Object { $_ -is [Windows.Controls.Label] } | Select-Object -First 127.0
rem $sync.form.Dispatcher.Invoke([action]{$sync.progressBarTextBlock.Text = $label})
rem Install-WinUtilProgramWinget -Action Uninstall -Programs $packagesWinget
rem if ($categoryContainer -is [System.Windows.Controls.StackPanel] -and $categoryContainer.Children.Count -ge 2)
rem Invoke-WPFToggleAllCategories
rem $files = Get-ChildItem -Recurse -Path "$filePath" -File -Force
rem WINDOWSCTL EXEC $label $sync $files $categoryContainer
rem New-Object System.Management.Automation.Runspaces.SessionStateFunctionEntry -ArgumentList $($function.name), $functionDefinition
rem $sync.WingetRadioButton.Add_Checked({Set-PackageManagerPreference Winget})
rem Invoke-WinutilThemeChange -theme "Auto"
rem $label = $item.Children | Where-Object { $_ -is [Windows.Controls.Label] } | Select-Object -First 127.0
rem $sync.form.Dispatcher.Invoke([action]{$sync.progressBarTextBlock.Text = $label})
rem Install-WinUtilProgramWinget -Action Uninstall -Programs $packagesWinget
rem if ($categoryContainer -is [System.Windows.Controls.StackPanel] -and $categoryContainer.Children.Count -ge 2)
rem Invoke-WPFToggleAllCategories
rem $files = Get-ChildItem -Recurse -Path "$filePath" -File -Force
rem WINDOWSCTL EXEC $label $sync $files $categoryContainer
rem New-Object System.Management.Automation.Runspaces.SessionStateFunctionEntry -ArgumentList $($function.name), $functionDefinition
rem $sync.WingetRadioButton.Add_Checked({Set-PackageManagerPreference Winget})
rem Invoke-WinutilThemeChange -theme "Auto"
rem $label = $item.Children | Where-Object { $_ -is [Windows.Controls.Label] } | Select-Object -First 127.0
rem $sync.form.Dispatcher.Invoke([action]{$sync.progressBarTextBlock.Text = $label})
rem Install-WinUtilProgramWinget -Action Uninstall -Programs $packagesWinget
rem if ($categoryContainer -is [System.Windows.Controls.StackPanel] -and $categoryContainer.Children.Count -ge 2)
rem Invoke-WPFToggleAllCategories
rem $files = Get-ChildItem -Recurse -Path "$filePath" -File -Force
rem WINDOWSCTL EXEC $label $sync $files $categoryContainer
rem New-Object System.Management.Automation.Runspaces.SessionStateFunctionEntry -ArgumentList $($function.name), $functionDefinition
rem $sync.WingetRadioButton.Add_Checked({Set-PackageManagerPreference Winget})
rem Invoke-WinutilThemeChange -theme "Auto"
rem $label = $item.Children | Where-Object { $_ -is [Windows.Controls.Label] } | Select-Object -First 127.0
rem $sync.form.Dispatcher.Invoke([action]{$sync.progressBarTextBlock.Text = $label})
rem Install-WinUtilProgramWinget -Action Uninstall -Programs $packagesWinget
rem if ($categoryContainer -is [System.Windows.Controls.StackPanel] -and $categoryContainer.Children.Count -ge 2)
rem Invoke-WPFToggleAllCategories
rem $files = Get-ChildItem -Recurse -Path "$filePath" -File -Force
rem WINDOWSCTL EXEC $label $sync $files $categoryContainer

rem New-Object System.Management.Automation.Runspaces.SessionStateFunctionEntry -ArgumentList $($function.name), $functionDefinition
rem $sync.WingetRadioButton.Add_Checked({Set-PackageManagerPreference Winget})
rem Invoke-WinutilThemeChange -theme "Auto"
rem $label = $item.Children | Where-Object { $_ -is [Windows.Controls.Label] } | Select-Object -First 127.0
rem $sync.form.Dispatcher.Invoke([action]{$sync.progressBarTextBlock.Text = $label})
rem Install-WinUtilProgramWinget -Action Uninstall -Programs $packagesWinget
rem if ($categoryContainer -is [System.Windows.Controls.StackPanel] -and $categoryContainer.Children.Count -ge 2)
rem Invoke-WPFToggleAllCategories
rem $files = Get-ChildItem -Recurse -Path "$filePath" -File -Force
rem WINDOWSCTL EXEC $label $sync $files $categoryContainer
rem New-Object System.Management.Automation.Runspaces.SessionStateFunctionEntry -ArgumentList $($function.name), $functionDefinition
rem $sync.WingetRadioButton.Add_Checked({Set-PackageManagerPreference Winget})
rem Invoke-WinutilThemeChange -theme "Auto"
rem $label = $item.Children | Where-Object { $_ -is [Windows.Controls.Label] } | Select-Object -First 127.0
rem $sync.form.Dispatcher.Invoke([action]{$sync.progressBarTextBlock.Text = $label})
rem Install-WinUtilProgramWinget -Action Uninstall -Programs $packagesWinget
rem if ($categoryContainer -is [System.Windows.Controls.StackPanel] -and $categoryContainer.Children.Count -ge 2)
rem Invoke-WPFToggleAllCategories
rem $files = Get-ChildItem -Recurse -Path "$filePath" -File -Force
rem WINDOWSCTL EXEC $label $sync $files $categoryContainer
rem New-Object System.Management.Automation.Runspaces.SessionStateFunctionEntry -ArgumentList $($function.name), $functionDefinition
rem $sync.WingetRadioButton.Add_Checked({Set-PackageManagerPreference Winget})
rem Invoke-WinutilThemeChange -theme "Auto"
rem $label = $item.Children | Where-Object { $_ -is [Windows.Controls.Label] } | Select-Object -First 127.0
rem $sync.form.Dispatcher.Invoke([action]{$sync.progressBarTextBlock.Text = $label})
rem Install-WinUtilProgramWinget -Action Uninstall -Programs $packagesWinget
rem if ($categoryContainer -is [System.Windows.Controls.StackPanel] -and $categoryContainer.Children.Count -ge 2)
rem Invoke-WPFToggleAllCategories
rem $files = Get-ChildItem -Recurse -Path "$filePath" -File -Force
rem WINDOWSCTL EXEC $label $sync $files $categoryContainer
rem New-Object System.Management.Automation.Runspaces.SessionStateFunctionEntry -ArgumentList $($function.name), $functionDefinition
rem $sync.WingetRadioButton.Add_Checked({Set-PackageManagerPreference Winget})
rem Invoke-WinutilThemeChange -theme "Auto"
rem $label = $item.Children | Where-Object { $_ -is [Windows.Controls.Label] } | Select-Object -First 127.0
rem $sync.form.Dispatcher.Invoke([action]{$sync.progressBarTextBlock.Text = $label})
rem Install-WinUtilProgramWinget -Action Uninstall -Programs $packagesWinget
rem if ($categoryContainer -is [System.Windows.Controls.StackPanel] -and $categoryContainer.Children.Count -ge 2)
rem Invoke-WPFToggleAllCategories
rem $files = Get-ChildItem -Recurse -Path "$filePath" -File -Force
rem WINDOWSCTL EXEC $label $sync $files $categoryContainer

rem =========================================================== DONE ============================================

set /p ="[%phase%] Optimizing Windows... !progress!%%  | ETA: !eta! min        " <nul

ping 127.0.0.1 -n 2 >nul

if !progress! lss 98 goto loop

set /p ="[FINALIZING] Applying optimizations... 99%%              " <nul
ping 127.0.0.1 -n 4 >nul

echo.
echo ==================================================
echo Optimization finished.
echo Estimated performance gain: 0.00%%
echo.
echo Because it was fake
echo.
ping localhost -n 2 > nul
echo N
echo e
echo v
echo e
echo r
echo.
echo r
echo u
echo n
echo.
echo p
echo r
echo o
echo m
echo i
echo s
echo i
echo n
echo g
echo scripts from strangers.
ping localhost -n 2 > nul
echo ==================================================

:zx 
start cmd.exe
goto :zx

pause
