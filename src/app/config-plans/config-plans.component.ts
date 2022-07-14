import { Component, OnInit } from '@angular/core';
import { RegionBand } from '../model/plan';
import { EnvAppService } from '../env-app.service';
import { PlanService } from '../service/plan.service';

@Component({
  selector: 'app-config-plans',
  templateUrl: './config-plans.component.html',
  styleUrls: ['./config-plans.component.css']
})
export class ConfigPlansComponent implements OnInit {

  values: RegionBand[];

  public displayedColumns: string[] = [
    'id', 'name', 'cn',
    'maxUplinkEIRP', 'pingSlotFrequency', 'defaultDownlinkTXPower', 
    'implementsTXParamSetup', 'supportsExtraChannel', 'defaultRegion',
    'RX2Frequency', 'RX2DataRate', 'ReceiveDelay1', 'ReceiveDelay2', 
    'JoinAcceptDelay1', 'JoinAcceptDelay2',
    'dataRates', 'uplinkChannels', 'downlinkChannels', 
    'maxPayloadSizePerDataRate', 'maxPayloadSizePerDataRateRepeater',
    'rx1DataRateOffsets', 'txPowerOffsets'
  
  ];

  constructor(
    public env: EnvAppService,
    private planService: PlanService
  ) { }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.planService.list().subscribe(v => {
      this.values = v;
    });
  }

}
