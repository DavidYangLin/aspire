import { UserService, Broadcaster, downLoadService } from './../../app-service.service';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { NzMessageService, UploadXHRArgs } from 'ng-zorro-antd';

@Component({
  selector: 'app-call-phone',
  templateUrl: './call-phone.component.html',
  styleUrls: ['./call-phone.component.sass']
})
export class CallPhoneComponent implements OnInit {
  code:string;
  showFlag:string;
  _loading:boolean;
  userData:Array<any>;
  recordData:Array<any>;
  isVisibleMess:boolean = false;
  notes:string;
  noteId:string;

  page:any = {
    pageIndex:1,
    pageSize:5,
    keyWords:'',
    totalCount:0,
    sendState:'3'
  }

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
        this.setPhoneStatus(calee);
      },
      onHangUp: function (type) {
        console.log('这里是onHangUp事件，type = ', type)
      }
    })
    (window as any).workbench.changeVisible(true);
    if(this.showFlag){
      // (window as any).workbench.changeVisible(false);
    }else{
      // (window as any).workbench.changeVisible(true);
    }
    this.Broadcaster.broadcast('setContentPadd',true);
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

  setPhoneStatus(calee:any){
    this.http.post('sms/UpdatePhoneStatus',{},{params:{mobilePhone:calee}})
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
        // this.userData = data.data.list;
        // this.page.totalCount = data.data.totalCount;
        // this.page.pageIndex = data.data.pageIndex;
        console.log(data);
      }else{
        this.message.error('出错了!');
      }
      this._loading = false;
    },(err:any)=>{
      this.message.error(err.message);
      this._loading = false;      
    })
  }

  downLoadRecord(fileName:string){
    // this.downLoadService.downLoadFile()
  }

  refreshData(){
    this.getTableData();
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

  callPhone(callee:string){
    (window as any).workbench.call(callee,'auto','',false);
  }

  deletePhone(id:string){
    this._loading = true;
    this.http.post('sms/DeleteUserPhone',[id])
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
    console.log(index);
    if(index == '0'){
      this.getTableData();
    }else if(index == '1'){
      this.getTableDataRecord();
    }
  }

  ngOnDestroy(){
    this.Broadcaster.broadcast('setContentPadd',false);
  }

}
