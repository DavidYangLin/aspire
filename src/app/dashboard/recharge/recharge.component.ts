import { Broadcaster } from './../../app-service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, AbstractControl, FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'app-recharge',
  templateUrl: './recharge.component.html',
  styleUrls: ['./recharge.component.sass']
})
export class RechargeComponent implements OnInit {
  //充值类型
  rechargeType:any;
  //充值数量
  rechargeCount:any;
  //充值金额
  recharge:any;
  //充值方式
  rechargeMode:any
  //标签接收邮箱
  email:any
  isVisible:boolean = false;
  validateForm:FormGroup;
  isLoadNumber:string;
  rechargeTypeDisable:boolean = false;
  private messageSendQuery:any;
  that:any;
  unsubscribe:any;
  constructor(
    private http:HttpClient,
    private message:NzMessageService,
    private fb:FormBuilder,
    private router:ActivatedRoute,
    private route:Router,
    private Broadcaster:Broadcaster
  ) { 
    this.isLoadNumber = this.router.snapshot.queryParams.flag;
    this.messageSendQuery = JSON.parse(this.router.snapshot.queryParams.data);
    if(this.isLoadNumber == 'true'){
      this.rechargeTypeDisable = true;
    }
    this.unsubscribe = this.Broadcaster.on('getLoadNumberInfo').subscribe((data:any)=>{
      // this.messageSendQuery12.test = data.a; 
      console.log('212102010211111111111111111111111111111111111');
      console.log(this); 
    })
  }

  ngOnInit() {
    this.validateForm = this.fb.group({
      rechargeType: [ null, [ Validators.required ] ],
      rechargeCount: [ null, [ Validators.required ] ],
      recharge: [ null, [ Validators.required ] ],
      rechargeMode: [ null, [Validators.required] ],
      // email: [ null, [ ] ]
    });
    if(this.isLoadNumber == 'true'){
      this.validateForm.controls.rechargeType.setValue('5');
      if(!this.validateForm.controls.email){
        this.validateForm.addControl('email',new FormControl('',[Validators.required,Validators.email]))
      }
    }else{
      this.validateForm.addControl('rechargeType',new FormControl('',[Validators.required]))
    }
  }

  confirmRecharge(){
    if(this.validateForm.controls.rechargeType.value != '5'&&parseInt(this.validateForm.controls.rechargeCount.value) < 10000){
      this.message.info('短信十万条起发，请至少充值十万条短信!');
      return;
    }
    this.isVisible = true;
  }

  typeChange(event){
    if(event == '0'){
      if(this.validateForm.controls.email){
        this.validateForm.removeControl('email');
      }
    }else if(event == '1'){
      if(!this.validateForm.controls.email){
        this.validateForm.addControl('email',new FormControl('',[Validators.required,Validators.email]))
      }
    }
  }

  handleCancel(){
    this.isVisible = false;
  }

  handleOk(){
    let body = {
      rechargeType:this.validateForm.controls.rechargeType.value,
      rechargeWay:this.validateForm.controls.rechargeMode.value,
      rechargeNum:this.validateForm.controls.rechargeCount.value,
      amount:this.validateForm.controls.recharge.value
    }
    if(body.rechargeType == '5'){
      body = Object.assign(body,this.messageSendQuery);
    }
    this.http.post('sms/Recharge',body)
    .subscribe((data:any)=>{
      if(data.status == 1){
        this.isVisible == false;
        if(this.rechargeType == '0'){
          this.message.success('短信充值请求已发送，待管理员确认，短信充值数量稍后将会下发至你的账户，请注意查收!');
        }else{
          this.message.success('数据标签购买请求已发送，待管理员确认，数据标签稍后将会发送至你的邮箱，请注意查收!');
        }
      }else{
        this.message.error(data.message);
      }
    },(err:any)=>{
      this.message.error(err.message);
    })
  }

  test(){
    if(this.validateForm.controls.rechargeType.value == '0'||this.validateForm.controls.rechargeType.value == '3'||this.validateForm.controls.rechargeType.value == '4'){
      this.validateForm.controls.recharge.setValue(this.validateForm.controls.rechargeCount.value*0.15)
    }else if(this.validateForm.controls.rechargeType.value == '1'){
      this.validateForm.controls.recharge.setValue(this.validateForm.controls.rechargeCount.value*0.5)
    }else if(this.validateForm.controls.rechargeType.value == '5'){
      this.validateForm.controls.recharge.setValue(this.validateForm.controls.rechargeCount.value*15)
    }else{
      this.message.info('请先选择充值类型!');
    }
  }

  ngOnDestroy(){
    // this.unsubscribe.unsubscribe();
  }
}
