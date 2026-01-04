#!/bin/bash --posix
set -e

echo -e "\033[1m[NOTIFY] SnakeOS Build-time Dependencies Manager will now attempt to install missing dependencies.\033[0m"
echo -e "\033[1m[NOTIFY] \033[33mNote that dependencies that are already installed will either be updated or reinstalled.\033[0m"
echo -e "\033[1m[NOTIFY] If you don't want to proceed, press \033[31mCtrl-C\033[0m \033[1mto kill the process and abort the setup.\033[0m"

sleep 0.2
echo -e "\n"

# Loop until a valid choice is made
while true; do
  echo -e "\033[1m[CHOICE]\033[0m Select your distribution (or base, in case of derivatives):"
  echo "[A]rch [D]ebian [F]edora"
  sleep 0.2
  echo -e "\n"

  read -r distro

  # Install dependencies with package manager applicable for selected distro
  case "$distro" in
    [Aa])
      echo -e "\033[1m[NOTIFY]\033[0m Proceeding with pacman."
      sudo --user=root pacman -Sy
      sudo --user=root pacman -S make python gcc binutils nasm xorriso qemu mtools --needed
      break
      ;;
    [Dd])
      echo -e "\033[1m[NOTIFY]\033[0m Proceeding with APT."
      sudo --user=root apt update
      sudo --user=root apt install make python3 gcc binutils nasm xorriso qemu-system-x86
      break
      ;;
      [Ff])
      echo -e "\033[1m[NOTIFY]\033[0m Proceeding with DNF."
      sudo --user=root dnf install make python3 gcc binutils nasm xorriso qemu
      break
      ;;
    *)
      echo -e "\033[1m[ERROR]\033[0m Invalid selection. Please try again and select [A]rch, [D]ebian, or [F]edora."
      sleep 0.2
      ;;
  esac
done

echo -e "\033[1m[NOTIFY]\033[0m Downloading GHLA compiler..."

eval $(curl https://github.com/gorciu-official/shit-collection/raw/refs/heads/main/tooling/downloads/ghlac.sh -L)

# That's it.
