import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../app-service.service';
import { NzMessageService } from 'ng-zorro-antd';


@Component({ 
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  isCollapsed = false;
  userId:any;
  role:any = {
    isAdmin:false,
    isAgent:false,
    isUser:false
  }
  toggleCollapsed(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  text: string = '';

  constructor(private http:HttpClient,private route:ActivatedRoute,private router:Router,private user:UserService,private message:NzMessageService) { 
    this.userId = this.user.getUserId();
    var roles = this.user.getUserInfo().roles;
    this.text = this.user.getUserInfo().userName;
    if(roles.indexOf('admin')!=-1){
      this.role.isAdmin = true;
    }else if(roles.indexOf('agent')!=-1){
      this.role.isAgent = true;
    }else if(roles.indexOf('user')!=-1){
      this.role.isUser = true;
    }

    //初始化云呼叫中心
    // (window as any).workbench = new (window as any).WorkbenchSdk({
    //   dom: 'workbench',
    //   width: '280px',
    //   height: '550px',
    //   instanceId: 'cde0c27d-1578-41c2-bc59-f8fbd7b27f50',
    //   ajaxPath: '/aliyun/ccc/api',
    //   ajaxMethod: 'post',
    //   afterCallRule: 15,  // 挂机后的话后处理时间
    //   header: true,
    //   autoAnswerCall: 8,  // 有来电振铃响8s后自动接听
    //   useOpenApiSdk: true,
    //   exportErrorOfApi: true,
    //   moreActionList: ['mobilePhoneAnswer', 'break', 'offline'],
    //   onInit: function () {
    //     // win.workbench.register() // 想实现自动上线在此注册
    //   },
    //   onErrorNotify: function (error) {
    //     console.warn(error)
    //   },
    //   onCallComing: function (connid,caller,calee,contactId,skillgroupId) {
    //     console.log(connid,caller,calee,contactId,skillgroupId);
    //   },
    //   onCallDialing: function (connid,caller,calee,contactId) {
    //     console.log(connid,caller,calee,contactId);
    //   },
    //   onStatusChange: function (code, lastCode, context) {
    //     console.log(code, lastCode, context);
    //   },
    //   onCallEstablish: function (connid, caller, calee, contactId) {
    //     console.log('这里是通话建立时触发的回调函数', connid, caller, calee, contactId)
    //   },
    //   onCallRelease: function (connid, caller, calee, contactId) {
    //     console.log('这里是通话结束时触发的回调函数', connid, caller, calee, contactId)
    //   },
    //   onHangUp: function (type) {
    //     console.log('这里是onHangUp事件，type = ', type)
    //   }
    // })
  
  }

  ngOnInit() {
  }

  loginOut(){
    this.http.post('UserInfo/LogOut',{})
    .subscribe((data:any)=>{
      if(data.status == 1){
        this.router.navigate(['../login']);
        this.user.removeUserInfo();       
      }else{
        this.message.error(data.message);
      }
    },(err:any)=>{
      this.message.error(err.message);
    })
  }

  callPhone(){
    this.getCode();
  }

  getCode(){
    this.http.post('UserInfo/AccessToken',{})
    .subscribe((data:any)=>{
      if(data.status == 1){
        console.log(data);
      }else{
        // this.message.error(data.message);
        if(data.code == 'E001'){
          this.getLoginUrl();
        }
      }
    },(err:any)=>{
      this.message.error(err.message);

    })
  }

  getLoginUrl(){
    this.http.post('UserInfo/GetCallCode',{})
    .subscribe((data:any)=>{
      if(data.status == 1){
        window.open(data.data);
        document.getElementById('test').setAttribute('herf',data.data);
        document.getElementById('test').click();
      }else{ 
        this.message.error(data.message);
      }
    },(err:any)=>{
      this.message.error(err.message);
    })
  }

}
