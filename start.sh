# To start all processes and workers and configure runtime environment 

# Function to send messages to stderr
echoerr() { printf "%s\n" "$*" >&2; }

DIR="/sys/class/gpio/gpio45/"

# Turn on GNSS power
echo "Turn on OEM"

if [ -d "$DIR" ]; then
  ### Take action if $DIR exists ###
  echo "out" > /sys/class/gpio/gpio45/direction 
  echo "1" > /sys/class/gpio/gpio45/value
else
  ###  Control will jump here if $DIR does NOT exists ###
  echoerr directory not found
  echo "45" > /sys/class/gpio/export 
  echo "out" > /sys/class/gpio/gpio45/direction 
  echo "1" > /sys/class/gpio/gpio45/value
fi

echo "Config UART pins"
# UART 1
config-pin P9_24 uart 
config-pin P9_26 uart

# UART 2
config-pin P9_21 uart 
config-pin P9_22 uart

# UART 4
config-pin P9_11 uart 
config-pin P9_13 uart

# UART 5
config-pin P8_37 uart 
config-pin P8_38 uart

# Configure network
# echo "Configuring the network"
# source env-file
# printenv | grep UD

# ifconfig eth0 ${UD_IP} netmask ${UD_NMASK}
# ifconfig eth0 172.16.25.125 netmask 255.255.255.224
# route add default gw ${UD_GW}
# echo "nameserver ${UD_NS}" > /etc/resolv.conf

# echo "Configuration done, Current config:"
# echo "IP >>>"
# ip addr | grep eth0 | grep inet

# echo "Gateway >>>"
# netstat -nr | sed -n 1,3p

# echo "NameServer >>>"
# cat /etc/resolv.conf

# Set timezone
timedatectl set-timezone Asia/Tehran
