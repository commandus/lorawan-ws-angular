import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Employee } from '../model/employee';

@Component({
  selector: 'app-dialog-login',
  templateUrl: './dialog-login.component.html',
  styleUrls: ['./dialog-login.component.css']
})
export class DialogLoginComponent {
  @Output() logged = new EventEmitter<Employee>();
  @Output() cancelled = new EventEmitter<void>();
  title: string;
  message: string;
  employee: Employee;

  constructor(
    private dialogRef: MatDialogRef<DialogLoginComponent>,
    @Inject(MAT_DIALOG_DATA) data: {title: string, message: string, employee?: Employee }
  ) {
    this.title = data.title;
    this.message = data.message;
    this.employee = data.employee ? data.employee : new Employee();
  }

  onLogged(value: Employee) {
    this.logged.emit(value);
    if (value) {
      this.dialogRef.close( {yes: true} );
    }
  }

  onCancel() {
    this.cancelled.emit();
    this.dialogRef.close( { yes: false } );
  }

}
