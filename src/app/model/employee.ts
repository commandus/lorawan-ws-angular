export class Employee {
	public id: string;
	public token: string;
	public login: string;
	public password: string;
  
	private reset() {
		this.id = '';
		this.token = '';
		this.login = '';
	  	this.password = '';
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
  