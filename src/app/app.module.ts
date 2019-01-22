import { CookieService } from 'ngx-cookie-service';
import { ConfigService } from './model/config';
//import { DashboardModule } from '../app/dashboard/dashboard.module';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule,HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgZorroAntdModule, NZ_I18N, zh_CN } from 'ng-zorro-antd';
import { registerLocaleData, HashLocationStrategy, LocationStrategy, PathLocationStrategy, APP_BASE_HREF } from '@angular/common';
import zh from '@angular/common/locales/zh';
import { LoginComponent } from './login/login.component';
import { UserService, JwtInterceptorService } from './app-service.service';

registerLocaleData(zh);

const appRoutes:Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'dashboard',
    loadChildren:'./dashboard/dashboard.module#DashboardModule'
  },
  { path: '',
    redirectTo: '/login',
    pathMatch: 'full' 
  }
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule, 
    ReactiveFormsModule,
    HttpClientModule,
    NgZorroAntdModule,
    RouterModule.forRoot(appRoutes,{enableTracing:false})
  ],
  providers: [{provide:LocationStrategy,useClass: HashLocationStrategy},{ provide: APP_BASE_HREF, useValue: '/' },{ provide: NZ_I18N, useValue: zh_CN },{provide: HTTP_INTERCEPTORS, useClass: JwtInterceptorService, multi: true },UserService,ConfigService,CookieService],
  bootstrap: [AppComponent]
})
export class AppModule { } 
