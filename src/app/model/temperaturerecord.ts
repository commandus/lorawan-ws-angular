export class TemperatureRecord {
	public id: number;
	public kosa: number;
	public year: number;
	public no: number;
	public measured: number;
	public parsed: number;
	public vcc: number;
	public vbat: number;
	public t: number[];
	public tp: number[];
	public raw: string;
	public devname: string;
	public loraaddr: string;
	public received: string;
  
	private reset() {
	  this.id = 0;
	  this.kosa = 0;
	  this.year = 0;
	  this.no = 0;
	  this.measured = 0;
	  this.parsed = 0;
	  this.vcc = 0;
	  this.vbat = 0;
	  this.t = [];
	  this.tp = [];
  	  this.raw = '';
	  this.devname = '';
	  this.loraaddr = '';
	  this.received = '';
	}
  
	constructor(value: object = {}) {
	  this.reset();
	  if (typeof value !== 'undefined') {
		this.assign(value);
	  }
	}
  
	assign(value: object): any {
	  if (typeof value !== 'undefined') {
		Object.assign(this, value);
	  }
	}
  }
  