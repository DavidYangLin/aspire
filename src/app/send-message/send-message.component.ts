import { HttpClient } from '@angular/common/http';
import { UploadXHRArgs, NzMessageService } from 'ng-zorro-antd';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-send-message',
  templateUrl: './send-message.component.html',
  styleUrls: ['./send-message.component.sass']
})
export class SendMessageComponent implements OnInit {
  _loading:boolean = false;
  sendType:any = '0';
  importType:any = '0';
  id:string;
  messageDetail:any = {};
  sendFlag:boolean = false;
  type:any;

  constructor(
    private http:HttpClient,
    private message:NzMessageService,
    private route:ActivatedRoute,
    private router:Router
  ) { 
    this.id = this.route.snapshot.paramMap.get('id');
    this.type = this.route.snapshot.paramMap.get('type');

  }

  ngOnInit() {
  }

  customReq = (item:UploadXHRArgs)=>{
    let loading:any = this.message.loading('正在上传文件，请稍等');
    this.sendFlag = true;
    const formData = new FormData();
    formData.append('file',item.file as any);
    return this.http.post('api/File/UpFile',formData,{params:{UpFlag:'4',TaskId:this.id}})
    .subscribe((event:any)=>{
      this.message.remove(loading);
      this.sendFlag = false;
      if(event.status == 1){
        this.message.success('上传成功!');
        this._loading = true;
        item.onSuccess(event, item.file, event);
      }else{
        setTimeout(()=>{
          item.onError(event, item.file);
        })
        this.message.error(event.message);
      }
    },(err)=>{
      this.message.remove(loading);
      this.sendFlag = false;
      this.message.error('上传失败!');
    })
  }

  confirmSend(){
    if(this.sendType == '0'){
      this.directSend();
    }else if(this.sendType == '1'){
      if(!this.messageDetail.contents){
        this.message.info('发送内容不能为空!');
        return;
      }
      this.cloudSend();
    }
  }

  cloudSend(){
    this.http.post('sms/SendCloudSms',{taskId:this.id,contents:this.messageDetail.contents})
    .subscribe((data:any)=>{
      if(data.status==1){
        this.message.success('发送成功!');
        this.router.navigate(['dashboard/logQuery']);
      }else{
        this.message.error('出错了!');
      }
    },(err:any)=>{
      this.message.error(err.message);
    })
  }

  directSend(){
    this.http.post('sms/ChangeSendState','',{params:{smsTaskId:this.id,sendState:'2'}})
    .subscribe((data:any)=>{
      if(data.status==1){
        this.message.success('发送成功!');
        this.router.navigate(['dashboard/logQuery']);
      }else{
        this.message.error('出错了!');
      }
    },(err:any)=>{
      this.message.error(err.message);
    })
  }

  sendTypeChange(event){
    if(event == '1'){
      this.getMessageDetail();
    }
  }

  getMessageDetail(){
    this.http.post('sms/SendDetails','',{params:{smsTaskId:this.id}})
    .subscribe((data:any)=>{
      if(data.status==1){
        if(data.code == 'E001'){
          this.message.info('该用户发送的内容包含敏感词汇!');
        }
        this.messageDetail = data.data;
        if(this.messageDetail.isHasUpTel){
          this.messageDetail.phones = this.messageDetail.upTells[0].tell;
          for(var i = 1;i < this.messageDetail.upTells.length;i++){
            this.messageDetail.phones = this.messageDetail.phones + ',' + this.messageDetail.upTells[i].tell;
          }
        }
      }else{
        this.message.error('出错了!');
      }
    },(err:any)=>{
      this.message.error(err.message);
    })
  }

}
