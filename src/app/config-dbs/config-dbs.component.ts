import { Component, OnInit } from '@angular/core';

import { Dbs } from '../model/dbs';
import { EnvAppService } from '../env-app.service';
import { DbsService } from '../service/dbs.service';

@Component({
  selector: 'app-config-dbs',
  templateUrl: './config-dbs.component.html',
  styleUrls: ['./config-dbs.component.css']
})
export class ConfigDbsComponent implements OnInit {
  values: Dbs[];

  public displayedColumns: string[] = [
    'id', 'name', 'type', 'active', 'connection', 'login',
    'password', 'db', 'table_aliases', 'field_aliases', 'properties'
  ];

  constructor(
    public env: EnvAppService,
    private dbsService: DbsService
  ) { }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.dbsService.list().subscribe(v => {
      this.values = v;
    });
  }

}
