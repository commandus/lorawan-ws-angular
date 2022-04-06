import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FlexLayoutModule } from '@angular/flex-layout';

import { FormsModule } from '@angular/forms';

import { MatNativeDateModule } from '@angular/material/core';
import { MatOptionModule } from '@angular/material/core';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { DateAdapter } from '@angular/material/core';

import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatRadioModule } from '@angular/material/radio';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatPaginatorModule, MatPaginatorIntl } from '@angular/material/paginator';

import { SafeHtml } from './pipe-safe-html';
import { StripHtmlPipe } from './pipe-strip-html';

import { RuDateAdapter } from './rudateadapter';
import { DateDowPipe } from './pipe-date-dow';
import { MatPaginatorIntlRu } from './mat-paginator-ru';

import { AuthenticationInterceptor } from './auth-interceptor';
import { AuthenticationService } from './service/authentication.service';

import { RawComponent } from './raw/raw.component';
import { TemperatureComponent } from './temperature/temperature.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ControlPanelComponent } from './control-panel/control-panel.component';


@NgModule({
  declarations: [
    AppComponent,
    RawComponent,
    TemperatureComponent,
    DashboardComponent,

    StripHtmlPipe,
    SafeHtml,
    DateDowPipe,
    ControlPanelComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,

    FormsModule,

    HttpClientModule, FlexLayoutModule,
    MatCheckboxModule, MatListModule, MatChipsModule, MatToolbarModule, MatButtonModule,
    MatDatepickerModule, MatNativeDateModule, MatIconModule, MatSelectModule, MatOptionModule,
    MatFormFieldModule, MatInputModule, MatProgressBarModule, MatRadioModule,
    MatTableModule, MatSortModule, MatExpansionModule, MatAutocompleteModule, MatPaginatorModule, 
    MatDialogModule, MatChipsModule, MatSnackBarModule, MatTooltipModule, MatSlideToggleModule
  ],
  providers: [
    {
      provide: MAT_DATE_LOCALE,
      useValue: 'ru-RU'
    },
    {
      provide: DateAdapter,
       useClass: RuDateAdapter
    },
    AuthenticationService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthenticationInterceptor,
      multi: true
    },
    {
      provide: MatPaginatorIntl,
      useClass: MatPaginatorIntlRu
    }    
  ],
  entryComponents: [
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
