import { Component, OnInit } from '@angular/core';
import { EnvAppService } from '../env-app.service';

@Component({
  selector: 'app-control-panel',
  templateUrl: './control-panel.component.html',
  styleUrls: ['./control-panel.component.css']
})
export class ControlPanelComponent implements OnInit {

  constructor(
    public env: EnvAppService,
  ) { }

  ngOnInit(): void {
  }

}
