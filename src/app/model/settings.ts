export class Settings {
  mapType: number;
  sheetType: number;
  last: number[];

  private reset() {
    this.mapType = 0;
    this.sheetType = 0;
    this.last = [62.03389, 129.73306];
  }

  constructor(values: any) {
    this.reset();
    try {
      if (typeof values == 'string') {
        const v = JSON.parse(values);
        if (typeof v !== 'undefined') {
          Object.assign(this, v);
        }
      }
    } catch (error) {
      
    }
  }

  public save() {
    localStorage.setItem('settings', JSON.stringify(this));
  }

}
