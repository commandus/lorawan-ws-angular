import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EnvAppService } from '../env-app.service';
import * as L from 'leaflet';
import { GatewaysService } from '../service/gateways.service';

const iconRetinaUrl = 'assets/images/marker-icon-2x.png';
const iconUrl = 'assets/images/marker-icon.png';
const shadowUrl = 'assets/images/marker-shadow.png';

const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-map-gw',
  templateUrl: './map-gw.component.html',
  styleUrls: ['./map-gw.component.css']
})
export class MapGwComponent implements OnInit {

  constructor(
    private snackBar: MatSnackBar,
    private env: EnvAppService,
    public gatewaySvc: GatewaysService
  ) { }

  ngOnInit() {
    this.env.initMap();
  }

  ngOnDestroy(): void {
    this.env.destroyMap();
  }

  load() {
    this.gatewaySvc.list(0, 1024).subscribe(value => {
        for (let i = 0; i < value.length; i++) {
          this.env.addMarker(this.env.map, value[i].lati, value[i].long, value[i].name, value[i].gwid); 
        }
    },
    error => {
      let snackBarRef = this.snackBar.open('Сервис временно недоступен', 'Повторить');
      snackBarRef.onAction().subscribe(() => {
        this.load();
      });
      console.error(error);
    });
  }

  ngAfterViewInit(): void {
    this.load();
  }
}
