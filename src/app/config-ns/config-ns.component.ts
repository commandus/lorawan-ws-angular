import { Component, OnInit } from '@angular/core';
import { ConfigNS } from '../model/configns';
import { EnvAppService } from '../env-app.service';
import { ConfigNSService } from '../service/config.service';

@Component({
  selector: 'app-config-ns',
  templateUrl: './config-ns.component.html',
  styleUrls: ['./config-ns.component.css']
})
export class ConfigNsComponent implements OnInit {
  value: ConfigNS;

  constructor(
    public env: EnvAppService,
    private config: ConfigNSService,
  ) { }

  ngOnInit(): void {
    this.config.list().subscribe(v => {
      this.value = v;
    });
  }

}
