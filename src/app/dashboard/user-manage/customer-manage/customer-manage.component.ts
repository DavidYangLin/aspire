import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../../app-service.service';

@Component({
  selector: 'app-customer-manage',
  templateUrl: './customer-manage.component.html',
  styleUrls: ['./customer-manage.component.scss']
})
export class CustomerManageComponent implements OnInit {

  userForm: FormGroup;FormGroup  
  userData:Array<any>;
  userQuery:any;
  _loading:boolean = false;
  isVisible = false;
  value:any;
  isVisibleMess = false;
  selectedType:any;
  isAdd:boolean = true;
  isVisibleNumber:boolean = false;
  userId:any;
  checkOptionsOne = [
    { label: 'APP', value: '0', checked: false },
    { label: '关键字', value: '1', checked: false }
  ];
  checkOptionsTwo = [
    { label: '可查看', value: true, checked: false },
    { label: '不可查看', value: false, checked: false }
  ];
  appPermission:boolean = false;
  keyPermission:boolean = false;

  page:any = {
    flag:1,
    pageIndex:1,
    pageSize:5,
    keyWords:'',
    totalCount:0,
    agentUserId:''
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
    agentUserId:'',
    roles:['user']
  }
  charge:any = {
    smsType:'0',
    rechargeCount:0
  }
  isAdmin:boolean = false;


  constructor(private message:NzMessageService,private http:HttpClient,private user:UserService,private route:ActivatedRoute,private fb:FormBuilder) {
    if(this.user.getUserInfo()&&this.user.getUserInfo().roles.indexOf('admin')!=-1){
      this.isAdmin = true;
    }
    this.page.agentUserId = this.route.snapshot.paramMap.get('id');
  }

  ngOnInit() {
    this._loading = true;
    this.getPermission();
    //this.getTableData();
    this.userForm = this.fb.group({
      userName: [ null, [ Validators.required ] ],
      password:[null,[Validators.required]],      
      name: [ null, [ Validators.required ] ],
      contactPerson: [ null, [ Validators.required ] ],
      contactPhone: [ null, [ Validators.required ] ],
      minNumber:[5000,[Validators.required]],
      checkOption:[this.checkOptionsOne,[]],
      isSeeSendDetails:['0',[]]     
    })
  }

  refreshData(){
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
    returnData.agentUserId = this.page.agentUserId;
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
    returnData.isSeeSendDetails = returnData.isSeeSendDetails == '1' ? true:false;
    this.http.request('POST','userInfo/AddOrUpdateUser',{body:returnData})
    .subscribe((data:any)=>{
      if(data.status==1){
        this.message.success('保存成功!');
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
    this.http.request('POST','userInfo/StopOrStartUser',{params:{userId:id,userState:flag}})
    .subscribe((data:any)=>{
      if(data.status==1){
        if(flag=='1'){
          this.message.success('停用成功!');
        }
        if(flag=='0'){
          this.message.success('启用成功!');
        }
        this._loading = true;        
        this.getTableData();
      }else{
        this.message.error('出错了!');
      }
    },(err:any)=>{
      this.message.error(err.message);
    })
  }
  //充值
  reCharge(){
    this.http.request('POST','userInfo/AgentRechargeSms',
    {params:{smsType:this.charge.smsType.toString(),userId:this.userId,giveCount:this.charge.rechargeCount.toString()}})
    .subscribe((data:any)=>{
      if(data.status==1){
        this.message.success('充值成功!');
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

  showModal(flag:any,user?:any): void {
    this.isAdd = flag;
    this.isVisible = true;
    console.log(user);
    if(this.isAdd){
      // this.userObj = user;
      // this.userObj.userId = user.id;
      // this.userObj.roles = [user.roles];
      var perArr = [];
      let perFlag:boolean = false;
      if(this.appPermission){
        if(user.isApp){
          perFlag = true;
        }
        perArr.push({ label: 'APP', value: '0', checked: perFlag })
        perFlag = false;
      }
      if(this.keyPermission){
        if(user.isKeyword){
          perFlag = true;
        }
        perArr.push({ label: '关键字', value: '1', checked: perFlag })
      }
      // if(user.isSeeSendDetails){
      //   this.checkOptionsTwo[0].checked = true;
      //   this.checkOptionsTwo[1].checked = false;
      // }else{
      //   this.checkOptionsTwo[0].checked = false;
      //   this.checkOptionsTwo[1].checked = true;
      // }
      let isSeeSendDetails = '0';
      if(user.isSeeSendDetails){
        isSeeSendDetails = '1'
      }
      this.userForm = this.fb.group({
        userName: [ user.userName, [ Validators.required ] ],
        name: [ user.name, [ Validators.required ] ],
        password:[user.password,[]], 
        contactPerson: [ user.contactPerson, [ Validators.required ] ],
        contactPhone: [ user.contactPhone, [ Validators.required ] ],
        userId:[user.id],
        minNumber:[user.minNumber,[ Validators.required ]],
        checkOption:[perArr,[]] ,
        isSeeSendDetails:[isSeeSendDetails,[]],
        roles:[[user.roles]]
      })
    }else{
      var perArr = [];
      if(this.appPermission){
        perArr.push({ label: 'APP', value: '0', checked: false })
      }
      if(this.keyPermission){
        perArr.push({ label: '关键字', value: '1', checked: false })
      }
      this.userForm = this.fb.group({
        userName: [ null, [ Validators.required ] ],
        password:[null,[Validators.required]],        
        name: [ null, [ Validators.required ] ],
        contactPerson: [ null, [ Validators.required ] ],
        contactPhone: [ null, [ Validators.required ] ],
        minNumber:[100000,[Validators.required]],
        checkOption:[perArr,[]] ,
        isSeeSendDetails:['0',[]],
        roles:[['user']]    
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
    this.isVisible = false;
  }

  handleCancel(): void {
    this.isVisible = false;
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

  confirm(): void {
  }
  getPermission(){
    this.http.request('POST','sms/GetAppAndKeyPer',{})
    .subscribe((data:any)=>{
      if(data.status==1){
        this.appPermission = data.data.isApp;
        this.keyPermission = data.data.isKeyword;
        this.getTableData();
      }else{
        this.message.error(data.message);
      }
    },(err:any)=>{
      this.message.error(err.message);
    })
  }

}
