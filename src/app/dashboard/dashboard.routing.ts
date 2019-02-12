import { CallPhoneComponent } from './call-phone/call-phone.component';
import { RouterGuard } from './../router.guard';
import { LogQueryComponent } from './log-query/log-query.component';
import { KeySetComponent } from './sys-manage/key-set/key-set.component';
import { AppSetComponent } from './sys-manage/app-set/app-set.component';
import { LocationSetComponent } from './sys-manage/location-set/location-set.component';
import { CustomerManageComponent } from './user-manage/customer-manage/customer-manage.component';
import { AgentManageComponent } from './user-manage/agent-manage/agent-manage.component';
import { DashboardComponent } from './dashboard/dashboard.component';

import { Routes, RouterModule,CanLoad } from '@angular/router';
import { NgModule } from '@angular/core';
import { UserCenterComponent } from './user-center/user-center.component';
import { MessSentComponent } from './mess-sent/mess-sent.component';
import { SelfLogComponent } from './self-log/self-log.component';
import { MessageDetailComponent } from '../message-detail/message-detail.component';
import { TimeSetComponent } from './time-set/time-set.component';
import { RechargeComponent } from './recharge/recharge.component';
import { RechargeListComponent } from './recharge-list/recharge-list.component';

const routes: Routes = [
    { path: '',
      component: DashboardComponent,
      children:[
        { path: 'userCenter',
          component:UserCenterComponent,
          canActivate:[RouterGuard]
        },
        { path: 'agentManage',
          component:AgentManageComponent,
          canActivate:[RouterGuard]
        },
        { path: 'customerManage/:id',
          component:CustomerManageComponent,
          canActivate:[RouterGuard]
        },
        { path: 'messageSent',
          component:MessSentComponent,
          canActivate:[RouterGuard]
        },
        { path: 'locationSet', 
          component:LocationSetComponent,
          canActivate:[RouterGuard]
        },
        { path: 'appSet',
          component:AppSetComponent,
          canActivate:[RouterGuard]
        },
        { path: 'timeSet',
          component:TimeSetComponent,
          canActivate:[RouterGuard]
        },
        { path: 'keyWordSet',
          component:KeySetComponent,
          canActivate:[RouterGuard]
        },
        { path: 'logQuery',
          component:LogQueryComponent,
          canActivate:[RouterGuard]
        },
        { path: 'selfQuery',
          component:SelfLogComponent,
          canActivate:[RouterGuard]
        },
        { path: 'messageDetail/:id/:type',
          component:MessageDetailComponent
        },
        { path: 'callPhone',
          component:CallPhoneComponent
        },
        { path: 'batchCall/:flag',
          component:CallPhoneComponent
        },
        {
          path:'rechargeList',
          component:RechargeListComponent
        },
        {
          path:'recharge',
          component:RechargeComponent
        },
        {
            path: '',
            redirectTo:'userCenter',
            pathMatch:'full'
        }
      ]
    }
];  


@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
}) 
export class DashboardRoutingModule {}
