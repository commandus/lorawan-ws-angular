import { TemperatureRecord } from "./temperaturerecord";

export class TemperatureSheet {
	public id: number;
	public kosa: number;
	public year: number;
	public no: number;
	public measured: Date;
	public parsed: Date;
	public vcc: number;
	public vbat: number;
	public raw: string;
	public devname: string;
	public loraaddr: string;
	public received: string;
	public t1?: number;
	public t2?: number;
	public t3?: number;
	public t4?: number;
	public t5?: number;
	public t6?: number;
	public t7?: number;
	public t8?: number;
	public t9?: number;
	public t10?: number;
	public t11?: number;
	public t12?: number;
	public t13?: number;
	public t14?: number;
	public t15?: number;
	public t16?: number;
	public t17?: number;
	public t18?: number;
	public t19?: number;
	public t20?: number;
	public t21?: number;
	public t22?: number;
	public t23?: number;
	public t24?: number;
	public t25?: number;
	public t26?: number;
	public t27?: number;
	public t28?: number;
	public t29?: number;
	public t30?: number;

	public tp1?: number;
	public tp2?: number;
	public tp3?: number;
	public tp4?: number;
	public tp5?: number;
	public tp6?: number;
	public tp7?: number;
	public tp8?: number;
	public tp9?: number;
	public tp10?: number;
	public tp11?: number;
	public tp12?: number;
	public tp13?: number;
	public tp14?: number;
	public tp15?: number;
	public tp16?: number;
	public tp17?: number;
	public tp18?: number;
	public tp19?: number;
	public tp20?: number;
	public tp21?: number;
	public tp22?: number;
	public tp23?: number;
	public tp24?: number;
	public tp25?: number;
	public tp26?: number;
	public tp27?: number;
	public tp28?: number;
	public tp29?: number;
	public tp30?: number;

	private reset() {
	  this.id = 0;
	  this.kosa = 0;
	  this.year = 0;
	  this.no = 0;
	  this.measured = new Date(0);
	  this.parsed = new Date(0);
	  this.vcc = 0;
	  this.vbat = 0;
  	  this.raw = '';
	  this.devname = '';
	  this.loraaddr = '';
	  this.received = '';
	}
  
	constructor(value: TemperatureRecord) {
	  this.assign(value);
	}
  
	assign(value: TemperatureRecord): void {
		this.id = value.id;
		this.kosa = value.kosa;
		this.year = value.year;
		this.no = value.no;
		this.measured = new Date(value.measured * 1000);
		this.parsed = new Date(value.parsed * 1000);
		this.vcc = value.vcc;
		this.vbat = value.vbat;
		this.raw = value.raw;
		this.devname = value.devname;
		this.loraaddr = value.loraaddr;
		this.received = value.received;
		
		if (value.t.length > 1) {
			this.t1 = value.t[1];
			if (value.t.length > 2) {
				this.t2 = value.t[2];
				if (value.t.length > 3) {
					this.t3 = value.t[3];
					if (value.t.length > 4) {
						this.t4 = value.t[4];
						if (value.t.length > 5) {
							this.t5 = value.t[5];
							if (value.t.length > 6) {
								this.t6 = value.t[6];
								if (value.t.length > 7) {
									this.t7 = value.t[7];
									if (value.t.length > 8) {
										this.t8 = value.t[8];
										if (value.t.length > 9) {
											this.t9 = value.t[9];
											if (value.t.length > 10) {
												this.t10 = value.t[10];
												if (value.t.length > 11) {
													this.t11 = value.t[11];
													if (value.t.length > 12) {
														this.t12 = value.t[12];
														if (value.t.length > 13) {
															this.t13 = value.t[13];
															if (value.t.length > 14) {
																this.t14 = value.t[14];
																if (value.t.length > 15) {
																	this.t15 = value.t[15];
																	if (value.t.length > 16) {
																		this.t16 = value.t[16];
																		if (value.t.length > 17) {
																			this.t17 = value.t[17];
																			if (value.t.length > 18) {
																				this.t18 = value.t[18];
																				if (value.t.length > 19) {
																					this.t19 = value.t[19];
																					if (value.t.length > 20) {
																						this.t20 = value.t[20];
																						if (value.t.length > 21) {
																							this.t21 = value.t[21];
																							if (value.t.length > 22) {
																								this.t22 = value.t[22];
																								if (value.t.length > 23) {
																									this.t23 = value.t[23];
																									if (value.t.length > 24) {
																										this.t24 = value.t[24];
																										if (value.t.length > 25) {
																											this.t25 = value.t[25];
																											if (value.t.length > 26) {
																												this.t26 = value.t[26];
																												if (value.t.length > 27) {
																													this.t27 = value.t[27];
																													if (value.t.length > 28) {
																														this.t28 = value.t[28];
																														if (value.t.length > 29) {
																															this.t29 = value.t[29];
																															if (value.t.length > 30) {
																																this.t30 = value.t[30];
																															}
																														}
																													}
																												}
																											}
																										}
																									}
																								}
																							}
																						}
																						
																					}
																				}
																			}
																		}
																	}
																}
															}
														}
													}
												}

												
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}

		if (value.tp.length > 1) {
			this.tp1 = value.tp[1];
			if (value.tp.length > 2) {
				this.tp2 = value.tp[2];
				if (value.tp.length > 3) {
					this.tp3 = value.tp[3];
					if (value.tp.length > 4) {
						this.tp4 = value.tp[4];
						if (value.tp.length > 5) {
							this.tp5 = value.tp[5];
							if (value.tp.length > 6) {
								this.tp6 = value.tp[6];
								if (value.tp.length > 7) {
									this.tp7 = value.tp[7];
									if (value.tp.length > 8) {
										this.tp8 = value.tp[8];
										if (value.tp.length > 9) {
											this.tp9 = value.tp[9];
											if (value.tp.length > 10) {
												this.tp10 = value.tp[10];
												if (value.tp.length > 11) {
													this.tp11 = value.tp[11];
													if (value.tp.length > 12) {
														this.tp12 = value.tp[12];
														if (value.tp.length > 13) {
															this.tp13 = value.tp[13];
															if (value.tp.length > 14) {
																this.tp14 = value.tp[14];
																if (value.tp.length > 15) {
																	this.tp15 = value.tp[15];
																	if (value.tp.length > 16) {
																		this.tp16 = value.tp[16];
																		if (value.tp.length > 17) {
																			this.tp17 = value.tp[17];
																			if (value.tp.length > 18) {
																				this.tp18 = value.tp[18];
																				if (value.tp.length > 19) {
																					this.tp19 = value.tp[19];
																					if (value.tp.length > 20) {
																						this.tp20 = value.tp[20];
																						if (value.tp.length > 21) {
																							this.tp21 = value.tp[21];
																							if (value.tp.length > 22) {
																								this.tp22 = value.tp[22];
																								if (value.tp.length > 23) {
																									this.tp23 = value.tp[23];
																									if (value.tp.length > 24) {
																										this.tp24 = value.tp[24];
																										if (value.tp.length > 25) {
																											this.tp25 = value.tp[25];
																											if (value.tp.length > 26) {
																												this.tp26 = value.tp[26];
																												if (value.tp.length > 27) {
																													this.tp27 = value.tp[27];
																													if (value.tp.length > 28) {
																														this.tp28 = value.tp[28];
																														if (value.tp.length > 29) {
																															this.tp29 = value.tp[29];
																															if (value.tp.length > 30) {
																																this.tp30 = value.tp[30];
																															}
																														}
																													}
																												}
																											}
																										}
																									}
																								}
																							}
																						}
																						
																					}
																				}
																			}
																		}
																	}
																}
															}
														}
													}
												}
		
												
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
				
		
	}
  }
  