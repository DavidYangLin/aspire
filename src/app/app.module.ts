import { CallPhoneComponent } from './dashboard/call-phone/call-phone.component';
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
import { UserService, JwtInterceptorService, Broadcaster } from './app-service.service';
import { DashboardModule } from './dashboard/dashboard.module';
import { aliyunCallPhoneComponent } from './call-phone/call-phone.component';
import { AppPipe, PhoneFormatPipe } from './app.pipe';

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
  },
  {
    path:'aliyunCallPhone',
    component:aliyunCallPhoneComponent
  }
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    aliyunCallPhoneComponent,
    AppPipe,
    PhoneFormatPipe
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
  providers: [{provide:LocationStrategy,useClass: PathLocationStrategy},{ provide: APP_BASE_HREF, useValue: '/' },{ provide: NZ_I18N, useValue: zh_CN },{provide: HTTP_INTERCEPTORS, useClass: JwtInterceptorService, multi: true },UserService,ConfigService,CookieService,Broadcaster],
  bootstrap: [AppComponent]
})
export class AppModule { } 
