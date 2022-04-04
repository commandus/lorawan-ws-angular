import { Injectable } from '@angular/core';
import { Employee } from '../model/employee';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  employee: Employee;

  constructor(
  ) {
    // console.log('=== AuthenticationService ===');
    this.employee = new Employee(JSON.parse(localStorage.getItem('employee') || '{}'));
  }
}
