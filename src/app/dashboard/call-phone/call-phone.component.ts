import { UserService } from './../../app-service.service';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'app-call-phone',
  templateUrl: './call-phone.component.html',
  styleUrls: ['./call-phone.component.sass']
})
export class CallPhoneComponent implements OnInit {
  code:string;

  constructor(
    private ActivatedRoute:ActivatedRoute,
    private http:HttpClient,
    private message:NzMessageService,
    private user:UserService
  ) { }

  ngOnInit() {
    this.code = this.ActivatedRoute.snapshot.queryParamMap.get('code');
    if(this.code){
      this.getCallToken();
    }
    //初始化云呼叫中心
    (window as any).workbench = new (window as any).WorkbenchSdk({
      dom: 'workbench',
      width: '280px',
      height: '550px',
      instanceId: 'cde0c27d-1578-41c2-bc59-f8fbd7b27f50',
      ajaxPath: '/api/services/app/UserInfo/InitSdk',
      // ajaxType:'path',
      // ajaxOrigin:'http://localhost:6234',
      ajaxMethod: 'post',
      ajaxHeaders:{
        Authorization:this.user.getToken(),
        UserId:this.user.getUserId()
      },
      afterCallRule: 15,  // 挂机后的话后处理时间
      header: true,
      processorJSON: false,
      autoAnswerCall: 8,  // 有来电振铃响8s后自动接听
      useOpenApiSdk: false,
      exportErrorOfApi: true,
      moreActionList: ['mobilePhoneAnswer', 'break', 'offline'],
      onInit: function () {
        // win.workbench.register() // 想实现自动上线在此注册
        console.log('初始化成功');
      },
      onErrorNotify: function (error) {
        console.warn(error)
      },
      onCallComing: function (connid,caller,calee,contactId,skillgroupId) {
        console.log(connid,caller,calee,contactId,skillgroupId);
      },
      onCallDialing: function (connid,caller,calee,contactId) {
        console.log(connid,caller,calee,contactId);
      },
      onStatusChange: function (code, lastCode, context) {
        console.log(code, lastCode, context);
      },
      onCallEstablish: function (connid, caller, calee, contactId) {
        console.log('这里是通话建立时触发的回调函数', connid, caller, calee, contactId)
      },
      onCallRelease: function (connid, caller, calee, contactId) {
        console.log('这里是通话结束时触发的回调函数', connid, caller, calee, contactId)
      },
      onHangUp: function (type) {
        console.log('这里是onHangUp事件，type = ', type)
      }
    })
    // (window as any).workbench.changeVisible(true);
  }

  getCallToken(){
    this.http.post('UserInfo/GetCallToken',{},{params:{code:this.code}})
    .subscribe((data:any)=>{
      if(data.status == 1){
        this.message.success('获取成功!');
      }else{
        this.message.error(data.message);
      }
    },(err:any)=>{
      this.message.error(err.message);
    })
  }

}
