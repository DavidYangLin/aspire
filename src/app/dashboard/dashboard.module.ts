import { Broadcaster } from './../app-service.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { RouterModule, Routes } from '@angular/router';
import { DashboardRoutingModule } from './dashboard.routing';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AgentManageComponent } from './user-manage/agent-manage/agent-manage.component';
import { CustomerManageComponent } from './user-manage/customer-manage/customer-manage.component';
import { LocationSetComponent } from './sys-manage/location-set/location-set.component';
import { AppSetComponent } from './sys-manage/app-set/app-set.component';
import { KeySetComponent } from './sys-manage/key-set/key-set.component';
import { LogQueryComponent } from './log-query/log-query.component';
import { UserCenterComponent } from './user-center/user-center.component';
import { MessSentComponent } from './mess-sent/mess-sent.component';
import { SelfLogComponent } from './self-log/self-log.component';
import { MessageDetailComponent } from '../message-detail/message-detail.component';
import { TimeSetComponent } from './time-set/time-set.component';
import { CallPhoneComponent } from './call-phone/call-phone.component';
import { RechargeComponent } from './recharge/recharge.component';
import { RechargeListComponent } from './recharge-list/recharge-list.component';
import { BatchCallComponent } from './batch-call/batch-call.component';
import { SendMessageComponent } from '../send-message/send-message.component';
import { CloudBalanceComponent } from './cloud-balance/cloud-balance.component';
import { CloudLogComponent } from './cloud-log/cloud-log.component';

@NgModule({
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    DashboardRoutingModule,
    RouterModule,
    NgZorroAntdModule
  ],
  declarations: [DashboardComponent,MessSentComponent,UserCenterComponent, AgentManageComponent, CustomerManageComponent, LocationSetComponent, AppSetComponent, KeySetComponent, LogQueryComponent, SelfLogComponent,MessageDetailComponent,SendMessageComponent,TimeSetComponent, CallPhoneComponent, RechargeComponent, RechargeListComponent, BatchCallComponent, CloudBalanceComponent, CloudLogComponent]
})
export class DashboardModule { }
