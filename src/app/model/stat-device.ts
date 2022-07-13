export class PacketPrefix {
	version: number;
	token: number;
	tag: number;
	mac: string;
}

export class DeviceId {
	activation: string;
	class: string;
	deveui: string;
	nwkSKey: string;
	appSKey: string;
	version: string;
	appeui: string;
	appKey: string;
	nwkKey: string;
	devNonce: string;
	joinNonce: string;
	name: string;
}

export class DeviceMetadata {
	time: string;
	tmms: number;
	tmst: number;
	freq: number;
	chan: number;
	rfch: number;
	stat: number;
	modu: string;
	datr: string;
	codr: string;
	rssi: number;
	lsnr: number;
	size: number;
	data: string;
}

export class DeviceRFMHeaderHdrCtrlMac {
	major: number;
	mtype: string;
}

export class DeviceRFMHeaderHdrCtrl {
	foptslen: number;
	fpending: number;
	ack: number;
	adr: number;
	addr: string;
	mac: DeviceRFMHeaderHdrCtrlMac;
}

export class DeviceRFMHeaderHdr {
	fcnt: number;
	fctrl: DeviceRFMHeaderHdrCtrl;
}

export class DeviceRFMHeader {
	fport: number;
	fopts: string;
	header: DeviceRFMHeaderHdr;
}

export class DeviceStat {
	version: string;
	prefix: PacketPrefix;
	addr: string;
	id: DeviceId;
	metadata: DeviceMetadata[]; 
	rfm: DeviceRFMHeader;
	payload_size: number;
	mac: string[];
	mac_error_code: number;
	mac_error: string;
	payload: string;
}
