import { Component, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { Employee } from '../model/employee';
import { EnvAppService } from '../env-app.service';
import { TokenService } from '../service/token.service';

@Component({
  selector: 'app-employee-login',
  templateUrl: './employee-login.component.html',
  styleUrls: ['./employee-login.component.css']
})
export class EmployeeLoginComponent implements OnInit {
  @Input() employee: Employee;
  @Output() logged = new EventEmitter<Employee>();
  @Output() cancelled = new EventEmitter<void>();
  public formGroup: FormGroup;
  public progress = false;
  message = 'Попробуйте test/test';
  success: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private env: EnvAppService,
    private tokenService: TokenService
  ) {
    this.success = env.hasAccount();
    
  }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm() {
    this.formGroup = this.formBuilder.group({
      login: [this.employee ? this.employee.login : '',
        [ Validators.required ]],
      password: [this.employee ? this.employee.password : '',
        [ Validators.required ]
      ]
    });
   }

  cancel(): void {
    this.cancelled.emit();
  }

  login(): void {
    this.progress = true;
    let employee = new Employee(this.formGroup.getRawValue());

    this.tokenService.token(employee).subscribe(
      value => {
        this.progress = false;
        if (value) {
          this.success = true;
          this.message = 'Успешный вход';
          employee.token = value;
          this.logged.emit(employee);
        } else {
          this.success = false;
          this.message = 'Неуспешный вход, повторите';
          this.cancelled.emit();
        }
      },
      error => {
        this.progress = false;
        this.success = false;
        this.message = 'Неуспешный вход, повторите позже';
        this.cancelled.emit();
      });
  }

}
