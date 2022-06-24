export class RGB6 {
  public r: number;
  public g: number;
  public b: number;

  constructor(hexColor: string) {
    const ma = hexColor.match(/^#([0-9a-f]{6})$/i);
    if (ma) {
      this.r = parseInt(ma[1].substr(0, 2), 16);
      this.g = parseInt(ma[1].substr(2, 2), 16);
      this.b = parseInt(ma[1].substr(4, 2), 16);
    } else {
      this.r = 0;
      this.g = 0;
      this.b = 0;
    }
  }

  public toString(): string {
    return '#' + hex2(this.r) + hex2(this.g) + hex2(this.b);
  }

  public add(grayValue: number): RGB6 {
    const r = new RGB6(this.toString());
    r.r += grayValue;
    r.g += grayValue;
    r.b += grayValue;
    if (r.r < 0) {
      r.r = 0;
    }
    if (r.g < 0) {
      r.g = 0;
    }
    if (r.b < 0) {
      r.b = 0;
    }
    if (r.r > 255) {
      r.r = 255;
    }
    if (r.g > 255) {
      r.g = 255;
    }
    if (r.b > 255) {
      r.b = 255;
    }
    return r;
  }

}

function hex2(val: number) {
  let r = Number(val).toString(16);
  if (r.length < 2) {
    r = '0' + r;
  }
  return r;
}
