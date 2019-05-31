import { UserService, Broadcaster, downLoadService } from './../app-service.service';
// import { UserService, Broadcaster, downLoadService } from './../../app-service.service';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { NzMessageService, UploadXHRArgs } from 'ng-zorro-antd';

declare var WorkbenchSdk:any;

@Component({
  selector: 'app-call-phone',
  templateUrl: './call-phone.component.html',
  styleUrls: ['./call-phone.component.scss']
})

export class aliyunCallPhoneComponent implements OnInit {
  code:string;
  showFlag:string;
  _loading:boolean;
  userData:Array<any> = [];
  // recordData:Array<any>;
  // deleteData:Array<any> = [];
  isVisibleMess:boolean = false;
  notes:string;
  noteId:string;
  indexFlag:string = '0';
  padd:string = '20px';
  selectedValue:string;

  _allChecked = false;
  _indeterminate = false;


  page:any = {
    pageIndex:1,
    pageSize:10,
    keyWords:'',
    totalCount:0,
    sendState:'3',
    status:''
  }
  currentPhone:string;
  currentBatchCallPhone:any;

  constructor(
    private ActivatedRoute:ActivatedRoute,
    private http:HttpClient,
    private message:NzMessageService,
    private user:UserService,
    private Broadcaster:Broadcaster,
    // private downLoadService:downLoadService
  ) { 
    this.showFlag = this.ActivatedRoute.snapshot.paramMap.get('flag');
  }

  ngOnInit() {
    this.code = this.ActivatedRoute.snapshot.queryParamMap.get('code');
    this._loading = true;
    this.getTableData();
    if(this.code){
      this.getCallToken();
    }
    //初始化云呼叫中心
    (window as any).workbench = new WorkbenchSdk({
      dom: 'workbench',
      width: '280px',
      height: '550px',
      instanceId: 'cde0c27d-1578-41c2-bc59-f8fbd7b27f50',
      ajaxPath: '/home/InitSdk',
      // ajaxType:'path',
      // ajaxOrigin:'http://localhost:6234',
      ajaxMethod: 'post',
      ajaxApiParamName:'motion',
      ajaxHeaders:{
        Authorization:this.user.getToken(),
        UserId:this.user.getUserId()
      },
      afterCallRule: 15,  // 挂机后的话后处理时间
      header: true,
      // processorJSON: false,
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
      onCallEstablish: (connid, caller, calee, contactId) => {
        console.log('这里是通话建立时触发的回调函数', connid, caller, calee, contactId);
        if(this.currentBatchCallPhone){
          this.savePhoneInfo();
        }
      },
      onCallRelease:  (connid, caller, calee, contactId)=> {
        console.log('这里是通话结束时触发的回调函数', connid, caller, calee, contactId)
        this.setPhoneStatus(calee,1);
        this.currentBatchCallPhone = null;
      },
      onHangUp:  (type)=> {
        console.log('这里是onHangUp事件，type = ', type)
        if(type=='dialing'){
          this.setPhoneStatus(this.currentPhone,2);
        }else if(type=='outbound'){
          this.setPhoneStatus(this.currentPhone,1);
        }
      }
    })
    // (window as any).workbench.changeVisible(true);
    // this.Broadcaster.broadcast('setContentPadd',true);
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

  setPhoneStatus(calee:any,status:any){
    this.http.post('sms/UpdatePhoneStatus',{},{params:{mobilePhone:calee,status:status}})
    .subscribe((data:any)=>{
      if(data.status == 1){
        // this.message.success('获取成功!');
        this.getTableData();
      }else{
        this.message.error(data.message);
      }
    },(err:any)=>{
      this.message.error(err.message);
    })
  }

  customReq = (item:UploadXHRArgs)=>{
    const formData = new FormData();
    formData.append('file',item.file as any);
    return this.http.post('api/File/UpFile',formData,{params:{UpFlag:'3'}})
    .subscribe((event:any)=>{
      if(event.status == 1){
        this.message.success('上传成功!');
        this._loading = true;
        item.onSuccess(event, item.file, event);
        this.getTableData();
      }else{
        setTimeout(()=>{
          item.onError(event, item.file);
        })
        this.message.error(event.message);
      }
      // if(event instanceof HttpResponse){

      // }
    },(err)=>{
      this.message.error('上传失败!');
    })
  }

  getTableData(){
    this.http.post('sms/QueryUserPhone',this.page)
    .subscribe((data:any)=>{
      if(data.status==1){
        this.userData = data.data.list;
        console.log(this.userData);
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

  getTableDataRecord(){
    this.http.post('UserInfo/ListCallDetailRecords',this.page)
    .subscribe((data:any)=>{
      if(data.status==1){
        let tempData:any = JSON.parse(data.data).CallDetailRecords;
        this.userData = tempData.List.CallDetailRecord;
        if(tempData.PageNumber == '1'){
          this.page.totalCount = tempData.TotalCount;
        }
        this.page.pageIndex = tempData.PageNumber;
      }else{
        this.message.error('出错了!');
      }
      this._loading = false;
    },(err:any)=>{
      this.message.error(err.message);
      this._loading = false;      
    })
  }

  getDeletePhone(){
    this.http.post('sms/QueryDelUserPhone',this.page)
    .subscribe((data:any)=>{
      if(data.status==1){
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

  downLoadRecord(fileName:any){
    // this.downLoadService.downLoadFile()
    if(!fileName||fileName.length == 0){
      this.message.info('当前通话记录没有录音!');
      return;
    }
    this.http.post('UserInfo/DownloadRecording',{},{params:{FileName:fileName[0].FileName}})
    .subscribe((data:any)=>{
      if(data.status==1){
        var a = document.createElement('a');
        document.body.appendChild(a);
        a.setAttribute('style', 'display:none');
        a.setAttribute('href', JSON.parse(data.data).MediaDownloadParam.SignatureUrl);
        let time = new Date(parseInt(fileName[0].FileName.slice(0,13)));
        let downTime = `${time.getFullYear()}${time.getMonth()}${time.getDay()}${time.getHours()}${time.getMinutes()}${time.getSeconds()}`
        a.setAttribute('download', '录音文件'+downTime+'.wav');
        a.click();
      }else{
        this.message.error('出错了!');
      }
      this._loading = false;
    },(err:any)=>{
      this.message.error(err.message);
      this._loading = false;      
    })
  }
  
  lookDetail(data:any){
    (window as any).workbench.downloadRecord(data.ContactId,false);
  }

  refreshData(){
    // this.getTableData();
    this._loading = true;
    if(this.indexFlag == '0'){
      this.getTableData();
    }else if(this.indexFlag == '1'){
      this.getTableDataRecord();
    }else if(this.indexFlag == '2'){
      this.getDeletePhone();
    }
  }

  // importExcelData(){
  //   this.http.post('api/File/UpFile',{},{params:{upFlag:'3'}})
  //   .subscribe((data:any)=>{
  //     if(data.status==1){
  //     }else{
  //       this.message.error('出错了!');
  //     }
  //     this._loading = false;
  //   },(err:any)=>{
  //     this.message.error(err.message);
  //     this._loading = false;      
  //   }) 
  // }

  callPhone(data:any){
    this.currentBatchCallPhone = data;
    this.currentPhone = data.phone;
    (window as any).workbench.call(this.currentPhone,'02863209117','',false);
  }

  deletePhone(id:string|Array<any>){
    this._loading = true;
    let ids;
    if(!(id instanceof Array)){
      ids = [id];
    }else{
      ids = id;
    }
    this.http.post('sms/DeleteUserPhone',ids)
    .subscribe((data:any)=>{
      if(data.status==1){
        this.message.success('删除成功!');
        this.getTableData();
      }else{
        this.message.error('出错了!');
      }
      this._loading = false;
    },(err:any)=>{
      this.message.error(err.message);
      this._loading = false;      
    })
  }

  deleteAll(){
    this.http.post('sms/DeleteAllUserPhone','')
    .subscribe((data:any)=>{
      if(data.status==1){
        this.message.success('删除成功!');
        this.getTableData();
      }else{
        this.message.error('出错了!');
      }
      this._loading = false;
    },(err:any)=>{
      this.message.error(err.message);
      this._loading = false;      
    })
  }

  restorePhoneConfirm(){
    let data = [];
    this.userData.forEach((value)=>{
      if(value.checked){
        data.push(value.id);
      }
    })
    if(data.length == 0){
      this.message.info('请先选择你需要恢复的号码!')
      return;
    }
    this.restorePhone(data);
  }

  restorePhone(id:string|Array<any>){
    this._loading = true;
    let ids;
    if(!(id instanceof Array)){
      ids = [id];
    }else{
      ids = id;
    }
    this.http.post('sms/RecoverBatchUserPhone',ids)
    .subscribe((data:any)=>{
      if(data.status==1){
        this.message.success('恢复成功，请前往呼叫列表查看!');
        this.getDeletePhone();
      }else{
        this.message.error('出错了!');
      }
      this._loading = false;
    },(err:any)=>{
      this.message.error(err.message);
      this._loading = false;      
    })
  }

  restoreAllPhone(){
    this.http.post('sms/RecoverAllUserPhone','')
    .subscribe((data:any)=>{
      if(data.status==1){
        this.message.success('恢复成功，请前往呼叫列表查看!');
        this.getDeletePhone();
      }else{
        this.message.error('出错了!');
      }
      this._loading = false;
    },(err:any)=>{
      this.message.error(err.message);
      this._loading = false;      
    })
  }

  writeNote(id:string){
    this.isVisibleMess = true;
    this.noteId = id;
  }

  handleCancel(){
    this.isVisibleMess = false;
    this.notes = '';
  }

  handleOk(){
    this.http.post('sms/SetPhoneRemarks',{id:this.noteId,remarks:this.notes})
    .subscribe((data:any)=>{
      if(data.status==1){
        this.message.success('保存成功!');
        this.getTableData();
        this.isVisibleMess = false;
      }else{
        this.message.error('出错了!');
      }
    },(err:any)=>{
      this.message.error(err.message);
    })
  }

  test(index){
    this._loading = true;
    this.userData = [];
    this.page.pageIndex = 1;
    this.page.keyWords = '';
    if(index == '0'){
      this.getTableData();
    }else if(index == '1'){
      this.getTableDataRecord();
    }else if(index == '2'){
      this.getDeletePhone();
    }
    this.indexFlag = index;
  }

  ngOnDestroy(){
    this.Broadcaster.broadcast('setContentPadd',false);
  }

  batchDelete(){
    let data = [];
    this.userData.forEach((value)=>{
      if(value.checked){
        data.push(value.id);
      }
    })
    if(data.length == 0){
      this.message.info('请先选择你需要删除的号码!')
      return;
    }
    this.deletePhone(data);
  }

  queryData(){
    this.page.pageIndex = 1;
    this.getTableData();
  }

  savePhoneInfo(){
    this.http.post('sms/SetPhoneRemarks',{id:this.noteId,remarks:this.notes})
    .subscribe((data:any)=>{
      if(data.status==1){
        this.message.success('保存成功!');
        this.getTableData();
        this.isVisibleMess = false;
      }else{
        this.message.error('出错了!');
      }
    },(err:any)=>{
      this.message.error(err.message);
    })
  }

  _refreshStatus() {
    const allChecked = this.userData.every(value => value.checked === true);
    const allUnChecked = this.userData.every(value => !value.checked);
    this._allChecked = allChecked;
    this._indeterminate = (!allChecked) && (!allUnChecked);
  }

  _checkAll(value) {
    if (value) {
      this.userData.forEach(data => {
        data.checked = true;
      }); 
    } else {
      this.userData.forEach(data => {
        data.checked = false;
      });
    }
    this._refreshStatus();
  }
}
