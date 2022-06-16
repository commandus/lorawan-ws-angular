import { Component } from '@angular/core';
import { EnvAppService } from '../env-app.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  constructor(
    private env: EnvAppService
  ) {

  }

  load(): void {
    console.log('Reload');
  }

}
