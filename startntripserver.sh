#!/bin/bash
# $Id: startntripserver.sh,v 1.2 2007/08/30 15:02:19 stuerze Exp $
# Purpose: Start ntripserver

# while true; do ./ntripserver -M 1 -i $SPORT -b $BRATE -O 2 -a $CASTER -p $CPORT -m $MOUNTPOINT -c $CPASS; sleep 60; done
./ntripserver -M 1 -i $SPORT -b $BRATE -O $OUTPUT -a $CASTER -p $CPORT -m $MOUNTPOINT -c $CPASS
# ./ntripserver -M 1 -i /dev/ttyO4 -b 115200 -O 2 -a 192.168.1.189 -p 2101 -m BUCU0 -c sesam01
