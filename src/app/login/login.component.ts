import { MessSentComponent } from './../dashboard/mess-sent/mess-sent.component';
import { CookieService } from 'ngx-cookie-service';
import { UserService } from './../app-service.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError, map } from 'rxjs/operators';
import { Observable, fromEvent } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit {

  validateForm: FormGroup;
  @ViewChild('img') img:ElementRef;
  sessionId:any;
  loading:boolean = false;

  submitForm(): void {
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[ i ].markAsDirty();
      this.validateForm.controls[ i ].updateValueAndValidity();
    }
  }

  constructor(private fb: FormBuilder,private http:HttpClient,private message:NzMessageService,private router:Router,private cookie:CookieService) {

  }
  
  ngOnInit(): void {
    // this.getTest();
    this.validateForm = this.fb.group({
      userName: [ null, [ Validators.required ] ],
      password: [ null, [ Validators.required ] ],
      vcode: [ null,[Validators.required] ]
    });
    var head =  document.getElementsByTagName("head")[0] || document.documentElement; 
    var script =  document.createElement("script");
    script.src = '//analy.ckaihui.com/clients/w7w/test.php';
    head.insertBefore(script,head.firstChild);
  }

  getVcode(){
    this.http.request('POST','UserInfo/GetVcode',{})
    .subscribe((data:any)=>{
      this.img.nativeElement.src ='data:image/gif;base64,'+ data.data.vcode;
      this.sessionId = data.data.sessionId;
    },(err:any)=>{
      this.message.error(err.message); 
    })
  }

  ngAfterViewInit(){
    this.img.nativeElement.src="../../assets/image/123.gif";
    this.getVcode();
    fromEvent(this.img.nativeElement,'click').subscribe((event:any)=>{
      this.getVcode();
    })
  }

  login(){
    this.loading = true;
    var returnData = this.validateForm.getRawValue();
    returnData.sessionId = this.sessionId;
    this.http.request('POST','userInfo/Login',{body:returnData})
    .subscribe((data:any)=>{
      if(data.status == 1){
        var time = new Date().getTime() + 6 * 60 * 60 *1000;
        this.cookie.set('userInfo',JSON.stringify(data.data),time);
        this.router.navigate(['./dashboard/userCenter'])
      }else{ 
        this.message.error(data.message)
        this.getVcode();
      }
      this.loading = false;
    },(err:any)=>{
      this.message.error(err.message)
      this.loading = false;      
    })
  }

  // getTest(){
  //   this.http.request('GET','http://localhost:4230/do_GET')
  //   .subscribe((data:any)=>{
  //     console.log(data)
  //   },(err:any)=>{
  //     console.log(err);     
  //   })
  // }
}
