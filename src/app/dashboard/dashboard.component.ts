import { AfterViewInit, Component, OnInit } from '@angular/core';
import { EnvAppService } from '../env-app.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {

  constructor(
    private env: EnvAppService
  ) {

  }

  load(): void {
    console.log('Reload');
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
  }

}
