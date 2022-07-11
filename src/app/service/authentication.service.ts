import { Injectable } from '@angular/core';
import { Employee } from '../model/employee';
import { Reload } from '../model/reload';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService implements Reload{
  public employee: Employee;

  constructor(
  ) {
    this.load();
  }

  public load(): void {
    this.employee = new Employee(JSON.parse(localStorage.getItem('employee') || '{}'));
  }
}
