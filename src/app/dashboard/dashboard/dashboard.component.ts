import { Broadcaster } from './../../app-service.service';
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
  padd:string = '20px';
  role:any = {
    isAdmin:false,
    isAgent:false,
    isUser:false
  }
  toggleCollapsed(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  text: string = '';
  messageCount:number = 0;

  constructor(
    private http:HttpClient,
    private route:ActivatedRoute,
    private router:Router,
    private user:UserService,
    private message:NzMessageService,
    private Broadcaster:Broadcaster
    ) { 
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

      this.Broadcaster.on('setContentPadd').subscribe((data:any)=>{
        if(data){
          this.padd = '0px';
        }else{
          this.padd = '20px';
        }
      })
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

  callPhone(flag:boolean){
    window.open('https://ccc.aliyun.com/workbench/aspire','_blank')
    // this.getCode(flag);
  }

  getCode(flag:boolean){
    this.http.post('UserInfo/AccessToken',{})
    .subscribe((data:any)=>{
      if(data.status == 1){
        if(!flag){
          // this.router.navigate(['callPhone'],{relativeTo:this.route});
          window.open('/aliyunCallPhone','_blank');      
        }else{
          this.router.navigate(['batchCall/true'],{relativeTo:this.route});
          window.open('/aliyunCallPhone/true','_blank');      
        }
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

  getMessage(){
    this.http.post('',{})
    .subscribe((data:any)=>{
      if(data.status == 1){
        this.messageCount = data.data;
      }else{ 
        this.message.error(data.message);
      }
    },(err:any)=>{
      this.message.error(err.message);
    })
  }

}
