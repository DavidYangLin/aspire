import { Component, OnInit } from '@angular/core';
import { NzModalService, NzMessageBaseService, NzMessageService } from 'ng-zorro-antd';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-user-center',
  templateUrl: './user-center.component.html',
  styleUrls: ['./user-center.component.scss']
})
export class UserCenterComponent implements OnInit {
  userInfo:any = {
    id:'',
    userName:'',
    name:'',
    contactPerson:'',
    contactPhone:'',
    textSmsCount:'',
    imgSmsCount:'',
    videoSmsCount:'',
    sxSmsCount:'',
    baSmsCount:'',
  };
  isSpinning:boolean = true;
  isVisible:boolean = false;
  oldPassword:any;
  newPassword:any;
  userForm: FormGroup;

  constructor(private message:NzMessageService,private http:HttpClient,private router:Router,private fb:FormBuilder,private cook:CookieService) { }

  ngOnInit() {
    this.getUserInfo();
    this.userForm = this.fb.group({
      oldPassword: [ null, [ Validators.required ] ],
      newPassword:[null,[Validators.required]] 
    })
  }

  getUserInfo(){
    this.http.request('POST','userInfo/PersonalCenter')
    .subscribe((data:any)=>{
      this.userInfo = data.data;
      this.isSpinning = false;
    },(err:any)=>{
      this.message.error(err.message);
      this.isSpinning = false;
    })
  }

  save(){
    let flag:boolean = false;
    for (const i in this.userForm.controls) {
      this.userForm.controls[ i ].markAsDirty();
      this.userForm.controls[ i ].updateValueAndValidity();
      if(this.userForm.controls [i].invalid){
        flag = true;
      }
    }
    if(flag){
      return;
    }
    var returnObj = this.userForm.getRawValue();
    this.http.request('POST','UserInfo/UpdatePassword',
    {body:returnObj})
    .subscribe((data:any)=>{
      if(data.status == 1){
        this.isVisible = false;
        this.message.success('重置密码成功,请重新登录!');
        this.cook.delete('userInfo');
        setTimeout(()=>{
          this.router.navigate(['../login']);
        },1000)
      }else{
        this.message.error(data.message);
      }
    },(err:any)=>{
      this.message.error(err.message);
    })
  }

  resetPassword(){
    this.isVisible = true;
  }

  handleCancelNumber(){
    this.isVisible = false;
  }
}
