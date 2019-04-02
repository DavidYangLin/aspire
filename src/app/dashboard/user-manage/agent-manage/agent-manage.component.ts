import { AspireValidators } from './../../../aspire-validators.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { map } from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AnonymousSubject } from 'rxjs/internal/Subject';

@Component({
  selector: 'app-agent-manage',
  templateUrl: './agent-manage.component.html',
  styleUrls: ['./agent-manage.component.scss']
})
export class AgentManageComponent implements OnInit {

  userForm: FormGroup;
  userData:Array<any>;
  _loading:boolean = false;
  isVisible:boolean = false;
  isVisibleMess:boolean = false;
  isVisibleNumber:boolean = false;
  selectedType:any;
  isAdd:boolean = true;
  testNumber:any = 1;
  checkOptionsOne = [
    { label: 'APP', value: '0', checked: false },
    { label: '关键字', value: '1', checked: false }
  ];
  appPermission:boolean = false;
  keyPermission:boolean = false;

  nestedTableData = [];
  innerTableData = [];
  page:any = {
    flag:0,
    pageIndex:1,
    pageSize:5,
    keyWords:'',
    totalCount:0
  }
  userObj:any = {
    userId:'',
    userName:'',
    name:'',
    contactPerson:'',
    contactPhone:'',
    textSmsCount:'',
    imgSmsCount:'',
    videoSmsCount:'',
    sxSmsCount:'',
    baSmsCount:'',
    roles:['agent']
  }
  charge:any = {
    smsType:'0',
    rechargeCount:0
  }
  userId:any;



  constructor(private message:NzMessageService,private http:HttpClient,private fb: FormBuilder) { 
    this.getTableData();
  }

  ngOnInit() {
    //var arr = []
    this._loading = true;
    this.userForm = this.fb.group({
      userName: [ null, [ Validators.required ] ],
      password:[null,[Validators.required]],
      name: [ null, [ Validators.required ] ],
      contactPerson: [ null, [ Validators.required ] ],
      contactPhone: [ null, [ Validators.required ] ],
      minNumber:[100000,[Validators.required]],
      checkOption:[this.checkOptionsOne,[]]      
    })
  }

  refreshData(){
    this.getTableData();
  }
  queryData(){
    this.page.pageIndex = 1;
    this.getTableData();
  }
  //列表操作
  //获取数据
  getTableData(){
    this.http.request('POST','userInfo/UserList',{body:this.page})
    .subscribe((data:any)=>{ 
      if(data.status==1){
        data.data.list.map((item:any)=>{
          item.count = item.textSmsCount + item.imgSmsCount + item.videoSmsCount + item.baSmsCount + item.sxSmsCount;
        })
        this.userData = data.data.list;
        this.page.totalCount = data.data.totalCount;
        this.page.pageIndex = data.data.pageIndex;
      }else{
        this.message.error('出错了!');
      }
      this._loading = false;
    },(err:any)=>{
      this.message.error(err.message);
      this._loading = false;      
    })
  }
  //保存
  saveUser(){
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
    var returnData = this.userForm.getRawValue();
    if(returnData.checkOption[0].checked){
      returnData.isApp = true;
    }
    if(returnData.checkOption[1].checked){
      returnData.isKeyword = true;
    }
    if(parseInt(returnData.minNumber) < 5000){
      this.message.info('最少发送量不能小于5000');
      return;
    }
    this.http.request('POST','userInfo/AddOrUpdateUser',{body:returnData})
    .subscribe((data:any)=>{
      if(data.status==1){
        this.message.success('保存成功!');
        this.page.pageIndex =1;
        this._loading = true;        
        this.getTableData();
      }else{
        this.message.error(data.message);
      }
      this.isVisible = false;
    },(err:any)=>{
      this.message.error(err.message);
    })
  }
  //停用启用
  setUser(id:any,flag:any){
    this._loading = true;    
    this.http.request('POST','userInfo/StopOrStartUser',{params:{userId:id,userState:flag}})
    .subscribe((data:any)=>{
      if(data.status==1){
        if(flag=='1'){
          this.message.success('停用成功!');
        }
        if(flag=='0'){
          this.message.success('启用成功!');
        }
        this.page.pageIndex = 1;
        this.getTableData();
      }else{
        this.message.error('出错了!');
      }
    },(err:any)=>{
      this.message.error(err.message);
    })
  }
  showModal(flag:boolean,user?:any): void {
    this.isAdd = flag;
    this.isVisible = true;
    if(this.isAdd){
      // this.userObj = user;
      // this.userObj.roles = [user.roles]
      // this.userObj.userId = user.id;
      if(user.isApp){
        this.checkOptionsOne[0].checked = true;
      }else{
        this.checkOptionsOne[0].checked = false;
      }
      if(user.isKeyword){
        this.checkOptionsOne[1].checked = true;
      }else{
        this.checkOptionsOne[1].checked = false;
      }
      this.userForm = this.fb.group({
        userName: [ user.userName, [ Validators.required ] ],
        name: [ user.name, [ Validators.required ] ],
        password:[user.password,[]], 
        contactPerson: [ user.contactPerson, [ Validators.required ] ],
        contactPhone: [ user.contactPhone, [ Validators.required ] ],
        userId:[user.id],
        minNumber:[user.minNumber,[Validators.required]],
        checkOption:[this.checkOptionsOne,[]] ,
        roles:[[user.roles]]
      })
    }else{
      this.checkOptionsOne[0].checked = false;
      this.checkOptionsOne[1].checked = false;
      this.userForm = this.fb.group({
        userName: [ null, [ Validators.required] ],
        password:[null,[Validators.required]],
        name: [ null, [ Validators.required ] ],
        contactPerson: [ null, [ Validators.required ] ],
        contactPhone: [ null, [ Validators.required ] ],
        minNumber:[100000,[Validators.required]],        
        checkOption:[this.checkOptionsOne,[]] ,
        roles:[['agent']]    
      })
    }
  }
  showModalMess(id:any): void {
    this.isVisibleMess = true;
    this.userId = id;
    
  }
  showModalNumber(data:any): void {
    this.isVisibleNumber = true;
    this.userObj = data;
  }

  handleOk(): void {
    // this.http.request('POST','')
    // .subscribe((data:any)=>{
    //   if(1){
    //     this.userData = data.Data;
    //   }else{
    //     this.message.error('出错了!');
    //   }
    // },(err:any)=>{
    //   this.message.error(err.message);
    // })
    this.isVisible = false;
  }

  handleCancel(): void {
    this.isVisible = false;
  }
  //充值
  handleOkMess(): void {
    this.http.request('POST','userInfo/RechargeSms',
    {params:{smsType:this.charge.smsType.toString(),userId:this.userId,rechargeCount:this.charge.rechargeCount.toString()}})
    .subscribe((data:any)=>{
      if(data.status==1){
        this.message.success('充值成功!');
        this._loading = true;        
        this.getTableData();
      }else{
        this.message.error('出错了!');
      }
      this.isVisibleMess = false;      
    },(err:any)=>{
      this.message.error(err.message);
    })
  }

  handleCancelMess(): void {
    this.isVisibleMess = false;
  }
  
  handleOkNumber(): void {
    this.isVisibleNumber = false;
  }

  handleCancelNumber(): void {
    this.isVisibleNumber = false;
  }

  resetPassword(id:any):void{
    this.http.request('POST','userInfo/ResetPassword',
    {params:{userId:id}})
    .subscribe((data:any)=>{
      if(data.status==1){
        this.message.success('重置成功!');
        this._loading = true;        
        this.getTableData();
      }else{
        this.message.error('出错了!');
      }
      this.isVisibleMess = false;
    },(err:any)=>{
      this.message.error(err.message);
    })
  }

  deleteUser(userId:any){
    this.http.request('POST','UserInfo/DeletUser',
    {params:{userId:userId}})
    .subscribe((data:any)=>{
      if(data.status==1){
        this.message.success('删除成功!');
        this._loading = true;        
        this.getTableData();
      }else{
        this.message.error(data.message);
      }
      this.isVisibleMess = false;
    },(err:any)=>{
      this.message.error(err.message);
    })
  }

  cancel(): void {
  }
  updateSingleChecked(){

  }
}
