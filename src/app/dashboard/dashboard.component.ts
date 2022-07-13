import { Component, OnInit } from '@angular/core';

import { Version } from '../model/version';
import { VersionService } from '../service/version.service';
import { EnvAppService } from '../env-app.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  public version: Version;
  constructor(
    private env: EnvAppService,
    public versionService: VersionService
  ) {

  }
  ngOnInit(): void {
    this.versionService.list().subscribe((value) => {
      this.version = value;
    });
  }

}
