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

}
