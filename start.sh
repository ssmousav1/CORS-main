# To start all processes and workers and configure runtime environment 
[ -d "/sys/class/gpio/gpio45" ] && echo "Directory /path/dir/ exists."

# Turn on GNSS power
echo "Turn on OEM"
echo "45" > /sys/class/gpio/export 
echo "out" > /sys/class/gpio/gpio45/direction 
echo "1" > /sys/class/gpio/gpio45/value

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
