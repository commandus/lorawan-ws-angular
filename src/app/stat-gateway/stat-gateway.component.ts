import { Component, OnInit } from '@angular/core';
import { GatewayStat } from '../model/stat-gw';
import { GatewayStatService } from '../service/gwstat.service';
import { EnvAppService } from '../env-app.service';

@Component({
  selector: 'app-stat-gateway',
  templateUrl: './stat-gateway.component.html',
  styleUrls: ['./stat-gateway.component.css']
})
export class StatGatewayComponent implements OnInit {

  values: GatewayStat[];
  public displayedColumns: string[] = [
    'time', 'name', 'gwid', 'addr', 'geo', 'rxnb', 'rxok', 'rxfw', 'ackr', 'dwnb', 'txnb'
  ];

  constructor(
    public env: EnvAppService,
    private gatewayStatService: GatewayStatService,

  ) { }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.gatewayStatService.list().subscribe(v => {
      this.values = v;
    });
  }

  // Javascript does not correctly parse ISO8601, only 'Z' (UTC)
  s2t(v: string): Date {
    const fplus = v.lastIndexOf('+');
    const fminus = v.lastIndexOf('-');
    const f = fplus > fminus ? fplus : fminus;
    const p = v.split(v[f]);
    let d = new Date(p[0]).getTime();
    d += parseInt(p[1]) * 60 * 60 * 1000;
    return new Date(d);
  }

}
