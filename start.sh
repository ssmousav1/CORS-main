# To start all processes and workers and configure runtime environment 
# Turn on GNSS power
echo "45" > /sys/class/gpio/export 
echo "out" > /sys/class/gpio/gpio45/direction 
echo "1" > /sys/class/gpio/gpio45/value

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

# LED Pins                                                                                                                                                                          config-pin P8_12 gpio                                                                                                                                                               config-pin P8_13 gpio                                                                                                                                                               config-pin P8_14 gpio                                                                                                                                                               config-pin P8_15 gpio
