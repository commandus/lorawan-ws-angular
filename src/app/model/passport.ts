
export class PlumeId {
	public plume: number;	// 1
	public year: number;	// 3
	public id(): number 	///< used in the comparison
	{
		return this.year * 1000 + this.plume;
	}
}

export class Sensor {
	public mac: string;		// MAC address, hex 
	public coefficients: number[][];
}

export class Passport {
	public modified: number;	// unix epoch seconds
	public name: string;		// file name path
	public id: PlumeId;			// plume, year
	public sensors: Sensor[];	// 
	public checked: boolean;
}
