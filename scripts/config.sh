#!/usr/bin/env bash

if [[ "$1" == "ssh" ]]; then
  echo "Enabling sshd service"
  systemctl enable sshd.service

elif [[ "$1" == "ssh-start" ]]; then
  echo "Starting sshd service"
  systemctl start sshd.service

elif [[ "$1" == "ssh-stop" ]]; then
  echo "Stopping sshd service"
  systemctl stop sshd.service

elif [[ "$1" == "web-start" ]]; then
  echo "Starting nginx service"
  systemctl start nginx.service

elif [[ "$1" == "web-restart" ]]; then
  echo "Starting nginx service"
  systemctl restart nginx.service

elif [[ "$1" == "web-stop" ]]; then
  echo "Starting nginx service"
  systemctl stop sshd.service

elif [[ "$1" == "reboot" ]]; then
  echo "reboot ..."
  reboot

elif [[ "$1" == "ip" ]]; then
  echo "configuring ip"
  chmod +x ./commands/set-ip.sh
  ./commands/set-ip.sh

elif [[ "$1" == "gw" ]]; then
  echo "configuring gateway"
  chmod +x ./commands/set-gw.sh
  ./commands/set-gw.sh

elif [[ "$1" == "ns" ]]; then
  echo "configuring nameserver"
  chmod +x ./commands/set-ns.sh
  ./commands/set-ns.sh

else
	echo "configuring ip"
  chmod +x ./commands/set-ip.sh
  ./commands/set-ip.sh
  echo "configuring gateway"
  chmod +x ./commands/set-gw.sh
  ./commands/set-gw.sh
  echo "configuring nameserver"
  chmod +x ./commands/set-ns.sh
  ./commands/set-ns.sh
fi