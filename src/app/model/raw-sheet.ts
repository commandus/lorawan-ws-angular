import { RawRecord } from "./rawrecord";

export class RawSheet {
	public id: number;
	public raw: string;
	public devname: string;
	public loraaddr: string;
	public received: Date;

	private reset() {
	  this.id = 0;
	  this.raw = '';
	  this.devname = '';
	  this.loraaddr = '';
	  this.received = new Date(0);
	}
  
	constructor(value: RawRecord) {
	  this.assign(value);
	}
  
	assign(value: RawRecord): void {
		this.id = value.id;
		this.raw = value.raw;
		this.devname = value.devname;
		this.loraaddr = value.loraaddr;
		this.received = new Date(parseInt(value.received) * 1000);
	}
  }
  