export class BandDefaults {
	RX2Frequency: number;
	RX2DataRate: number;
	ReceiveDelay1: number;
	ReceiveDelay2: number;
	JoinAcceptDelay1: number;
	JoinAcceptDelay2: number;
}

export class DataRate { 
    uplink: boolean;
    downlink: boolean;
    modulation: string;
    bandwidth: number;
    spreadingFactor: number;
    bps: number;
}

export class Channel {
    frequency: number;
    minDR: number;
    maxDR: number;
    enabled: boolean;
    custom: boolean;
}

export class PayloadSizes {
	m: number;
	n: number;
}

export class RegionBand {
	id: number;
	name: string;
	cn: string;
	implementsTXParamSetup: boolean;
	maxUplinkEIRP: number;
	pingSlotFrequency: number;
	defaultDownlinkTXPower: number;
	supportsExtraChannels: boolean;
	defaultRegion: boolean;

	bandDefaults: BandDefaults;
	dataRates: DataRate[];
 	uplinkChannels: Channel[];
 	downlinkChannels: Channel[];
	maxPayloadSizePerDataRate: PayloadSizes[];
 	maxPayloadSizePerDataRateRepeater: number[];
 	rx1DataRateOffsets: number[][];
 	txPowerOffsets: number[];
}

export class RegionParameters {
	regionalParametersVersion: string;
	RegionBands: RegionBand[];
}
