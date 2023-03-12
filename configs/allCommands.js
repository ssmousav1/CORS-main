


const commands = [
  `$JMASK,10\r\n`,
  `$JI\r\n `,
  `$JMODE,SBASR,YES\r\n `,
  `$JSHOW\r\n`,
  `$JASC,GPGGA,r[,OTHER]\r\n`,
  `$JASC,GNGSA,r[,OTHER]\r\n`,
  `$JASC,GPGST,r[,OTHER]\r\n`,
  `$JASC,GPGSV,r[,OTHER]\r\n`,
  `$JASC,GLGSV,r[,OTHER]\r\n`,
  `$JASC,GAGSV,r[,OTHER]\r\n`,
  `$JASC,GBGSV,r[,OTHER]\r\n`,
  `$JASC,GPRMC,r[,OTHER]\r\n`,
  `$JASC,GPRRE,r[,OTHER]\r\n`,
  `$JASC,GPVTG,r[,OTHER]\r\n `,
  `$JASC,GPZDA,r[,OTHER]\r\n`,
  `$JRTK,1,lat,lon,height\r\n`,
  `$JRTK,1,P`,
  `$JOFF[,OTHER]\r\n `,
  `$JOFF,ALL\r\n `,
  `$JRTK,1\r\n `,
  `$JASC,RTCM3,r[,OTHER]\r\n `,
  `$JBIN,msg,r[,OTHER]\r\n `,
  `$JEPHOUT,1\r\n `,
  `$JSAVE\r\n`
]

const repsponseCommands = [
  { '$JI\r\n ': '$>JI,SN,FLT,HW,PROD,SDATE,EDATE,SW,DSP' },
  { '$JMODE,SBASR\r\n ': '$>JMODE,SBASR,YES' },
  { '$JSHOW\r\n': '' },
  { '$JRTK,1,lat,lon,height\r\n': '$>JRTK,1,FAILED,Reference Position Missing or Invalid for Present Location' },
  { '$JRTK,1\r\n ': '$>JRTK,1,LAT,LON,HEIGHT' },
  { '$JEPHOUT\r\n': '$>JEPHOUT,0' }
]