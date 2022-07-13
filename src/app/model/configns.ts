export class ConfigServer {
    listenAddressIPv4: string[];
    listenAddressIPv6: string[];
    identityStorageName: string;
    deviceHistoryStorageName: string;
    regionalSettingsStorageName: string;
    regionalSettingsChannelPlanName: string;
    queueStorageName: string;
    readBufferSize: number;
    verbosity: number;
    controlFPort: number;
    daemonize: boolean;
    storageType: string;
    gwStatStorageType: string;
    logGWStatisticsFileName: string;
    deviceStatStorageType: string;
    logDeviceStatisticsFileName: string;
    messageQueueStorageType: string;
	netId: number;
}

export class WSConfig {
	enabled: boolean;
	port: number;
	html: string;
	defaultDatabase: string;
	databases: string[];
	threadCount: number;
	connectionLimit: number;
	flags: number;
	issuer: string;
	secret: string;
	userListFileName: string;
}

export class ConfigNS {
	configFileName: string;
    gatewaysFileName: string;
	databaseConfigFileName: string;
    databaseExtraConfigFileNames: string[];
	server: ConfigServer;
	loggerDatabaseName: string;
    protoPath: string;
    gatewayPort: number;
}
