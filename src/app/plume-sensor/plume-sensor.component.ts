import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PassportService } from '../service/passport.service';
import { Passport } from '../model/passport';
import { EnvAppService } from '../env-app.service';

@Component({
  selector: 'app-plume-sensor',
  templateUrl: './plume-sensor.component.html',
  styleUrls: ['./plume-sensor.component.css']
})
export class PlumeSensorComponent implements OnInit {
  public progress = true;
  public year: number;
  public plume: number;
  public value: Passport;

  constructor(
    public env: EnvAppService,
    private passportService: PassportService,
    private activateRoute: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.year = activateRoute.snapshot.params['year'];
    this.plume = activateRoute.snapshot.params['plume'];
  }

  ngOnInit(): void {
    this.load(this.year, this.plume);
  }

  load(year: number, plume: number): void {
    this.passportService.list(year, plume, 0, 0).subscribe(
      val => {
        if (val && val.length) {
          this.value = val[0];
        }
        this.progress = false;
      },
      error => {
        let snackBarRef = this.snackBar.open('Сервис временно недоступен', 'Повторить');
        snackBarRef.onAction().subscribe(() => {
          this.load(this.year, this.plume);
        });
        this.progress = false;
      });
  }

}
