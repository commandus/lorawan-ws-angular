export class RawRecord {
	public id: number;
	public raw: string;
	public devname: string;
	public loraaddr: string;
	public received: string;
  
	private reset() {
	  this.id = 0;
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
  