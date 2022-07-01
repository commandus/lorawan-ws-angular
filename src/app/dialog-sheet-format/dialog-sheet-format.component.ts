import { Component, Inject, Output, EventEmitter } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-sheet-format',
  templateUrl: './dialog-sheet-format.component.html',
  styleUrls: ['./dialog-sheet-format.component.css']
})
export class DialogSheetFormatComponent {
  @Output() selected = new EventEmitter<number>();
  title: string;
  message: string;
  
  constructor(
    private dialogRef: MatDialogRef<DialogSheetFormatComponent>,
    @Inject(MAT_DIALOG_DATA) data: {title: string, message: string, sheetType?: number }
  ) {
    this.title = data.title;
    this.message = data.message;
  }

  /**
   * @param v 
   * 1 Excel 2007 XLSX
   * 2 Excel 2007 XLSB N/A
   * 3 Excel 97 XLS    N/A
   * 4 ODS             N/A
   * 5 Flat ODS        N/A
   * 6 CSV
   * 7 JSON            N/A
  */
  selectSheetType(v: number): void {
    if (v) {
      this.selected.emit(v);
      this.dialogRef.close({yes: true});
    }
  }
}
