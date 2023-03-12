const LEDCommands = {
	antConf: "ant:conf",
	antNone: "ant:none",
	antOK: "ant:ok",

	// Network status
	netConf: "net:conf",
	netNone: "net:none",
	netOK: "net:ok",
	netInt: 'net:internet',

	// NTRIP status
	ntripConf: 'ntrip:conf',
	ntripNone: 'ntrip:none',
	ntripOK: 'ntrip:ok',


	// OEM status
	oemConf: 'oem:conf',
	oemNone: 'oem:none',
	oemOK: 'oem:ok'
}

const WDCommands = {
	ntripStart: 'ntrip:start',
	ntripStop: 'ntrip:stop',
	ntripRestart: 'ntrip:restart',
	ntripUpdate: 'ntrip:update',
	ntripStatus: 'ntrip:status',
	ntripNew: 'ntrip:new',

	ntripConfigure: 'ntrip:configure',
	netConfig: 'net:configure',

	storageStatus: 'storage:status',
	storageUpdate: 'storage:update',

	WDLogs: 'msg:log',
	oemRestart: 'oem:restart',
	sysReboot: 'sys:reboot',

	sshOn: 'ssh:on',
	sshOff: 'ssh:off',

	uptimeStatus: 'uptime:status',
	uptimeUpdate: 'uptime:update',

	acpwrStatus: 'acpwr:status',
	acpwrUpdate: 'acpwr:update'
}

const smokeTest = {
	userDBOk: 'userdb:ok',
	userDBFail: 'userdb:fail',

	rawDBOk: 'rawdb:ok',
	rawDBFail: 'rawdb:fail',

	rawOk: 'raw:ok',
	rawFail: "raw:fail",

	netOk: "net:ok",
	netFail: "net:fail",

	webpanelOk: "webpanel:ok",
	webpanelFail: "webpanel:fail",

	rtcmOk: "rtcm:ok",
	rtcmFail: "rtcm:fail",

	oemRestart: 'oem:restart'
}

module.exports = {
	LEDCommands,
	smokeTest,
	WDCommands
}