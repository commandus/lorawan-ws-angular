export class Employee {
	public token: string;
	public login: string;
	public password: string;
  
	private reset() {
		this.token = '';
		this.login = '';
	  	this.password = '';
	}
  
	constructor(value: any = {}) {
	  this.reset();
	  try {
		let v;
		if (typeof value == 'string') {
		  	v = JSON.parse(value);
		} else {
			v = value;
		}
		if (typeof v !== 'undefined') {
			this.assign(v);
		}
	  } catch (error) {
		
	  }
	}
  
	public assign(value: object): any {
	  if (typeof value !== 'undefined') {
		Object.assign(this, value);
	  }
	}

	public logout(): void {
		this.reset();
		localStorage.removeItem('employee');
	  }
	
  }
  