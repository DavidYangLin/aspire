import { ConfigService } from './../model/config';
import { HttpClient, HttpRequest, HttpParams, HttpResponse } from '@angular/common/http';
import { UploadXHRArgs, NzMessageService, UploadFile } from 'ng-zorro-antd';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
declare var $:any;

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
  returnReason:string = '该次内容不符合发送规则，被驳回';
  fileList: UploadFile[] = [];
  filePath:string;
  acceptType = {
    txt:".txt",
    video:'.mp4,.3gp,',
    img:'.png,.jpg,.gif,.bmp',
    voice:'.mp3,.midi,.wav'
  }
  index:number = 0;
  $summernote:any;
  isVisibleMess:boolean = false;
  showCxItem:any = {};
  cxInfos:any;

  constructor(
    private http:HttpClient,
    private message:NzMessageService,
    private route:ActivatedRoute,
    private router:Router,
    private config:ConfigService,
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
    }else if(this.sendType == '3'){
      if(this.messageDetail.smsType=='1'||this.messageDetail.smsType=='2'){
        this.cloudSendCx()
      }else{
        if(!this.messageDetail.contents){
          this.message.info('发送内容不能为空!');
          return;
        }
        this.cloudSend();
      }
    }
  }

  cloudSend(){
    // if(this.messageDetail == '1'){
    //   this.messageDetail.contents = this.$summernote.summernote('code');
    // }
    let channel
    if(this.sendType == '3'){
      channel = '1';
    }else{
      channel = '0';
    }
    this.http.post('sms/SendCloudSms',{taskId:this.id,contents:this.messageDetail.contents,channel:channel})
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

  cloudSendCx(){
    let channel
    if(this.sendType == '3'){
      channel = '1';
    }else{
      channel = '0';
    }
    this.http.post('sms/SendCx',{taskId:this.id,channel:channel})
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

  returnBack(){
    if(!this.returnReason){
      this.message.info('请填写退回原因!');
      return;
    }
    this.http.post('sms/SendBack','',{params:{smsTaskId:this.id,returnReason:this.returnReason}})
    .subscribe((data:any)=>{
      if(data.status==1){
        this.message.success('退回成功!');
        this.router.navigate(['dashboard/logQuery']);
      }else{
        this.message.error('出错了!');
      }
    },(err:any)=>{
      this.message.error(err.message);
    })
  }

  sendTypeChange(event){
    if(event == '1'||event=='3'){
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
        if((this.messageDetail.smsType=='1'||this.messageDetail.smsType=='2')&&this.sendType=='3'){
          this.messageDetail.cxInfos = JSON.parse(this.messageDetail.cxInfos)
          if(this.messageDetail.cxInfos&&this.messageDetail.cxInfos.length > 0){
            this.messageDetail.cxInfos.forEach((item)=>{
              if(item.Img){
                let temp = item.Img.split('/');
                item.ImgList = [{
                  uid: 1,
                  name: temp[temp.length - 1],
                  status: 'done',
                  url: this.config.apiFile + item.Img,
                }]
              }
              if(item.Video){
                let temp = item.Video.split('/');
                item.VideoList = [{
                  uid: 1,
                  name: temp[temp.length - 1],
                  status: 'done',
                  url: this.config.apiFile + item.Video,
                }]
              }
              if(item.Voice){
                let temp = item.Voice.split('/');
                item.VoiceList = [{
                  uid: 1,
                  name: temp[temp.length - 1],
                  status: 'done',
                  url: this.config.apiFile + item.Voice,
                }]
              }
            })
          }
        }

        // if(this.messageDetail.smsType=='1'&&this.sendType=='3'){
        //   this.$summernote = $('#summernote').summernote({
        //     toolbar: [
        //       ['style', ['bold', 'italic', 'underline', 'clear']],
        //       ['font', ['strikethrough', 'superscript', 'subscript']],
        //       ['fontsize', ['fontsize']],
        //       ['color', ['color']],
        //       ['para', ['ul', 'ol', 'paragraph']],
        //       ['Insert',['picture']]
        //     ],
        //     callbacks:{
        //       onImageUpload:(files) => {
        //         const formData = new FormData();
        //         formData.append(files[0].name, files[0] as any);
        //         const req = new HttpRequest('POST',"api/File/UpFile", formData,
        //         {params:new HttpParams().set('UpFlag',this.messageDetail.smsType)});
        //         this.http.request(req).subscribe((event: any) => {
        //           if (event instanceof HttpResponse) {
        //             if (event.body.status == 1) {
        //               var filePath = this.config.apiFile + event.body.data.url;
        //               $('#summernote').summernote('insertImage', filePath, function($image){
        //                 $image.css('width','300');
        //                 $image.attr('data-filename',event.body.data.txt)
        //               });
        //             } else {
        //               this.message.error(event.body.message);
        //             }
        //           }
        //         }, (err) => {
        //         })
        //       }
        //     },
        //     height:'300px',
        //   });
        //   this.$summernote.summernote('code', this.messageDetail.contents);
        // }else{
        //   $('#summernote').summernote('destroy');
        // }
      }else{
        this.message.error('出错了!');
      }
    },(err:any)=>{
      this.message.error(err.message);
    })
  }

  uploader = (item: any) => {
    const formData = new FormData();
    formData.append(item.name, item.file as any);
    const req = new HttpRequest('POST',"api/File/UpFile", formData,
    {params:new HttpParams().set('UpFlag',this.messageDetail.smsType)});
    return this.http.request(req).subscribe((event: any) => {
      if (event instanceof HttpResponse) {
        if (event.body.status == 1) {
          item.onSuccess();
          this.filePath = event.body.data.url;
        } else {
          setTimeout(()=>{
            item.onError();
          })
          this.message.error(event.body.message);
        }
      }
    }, (err) => {
      setTimeout(() => {
        item.onError();
      });
    })
  }

  downLoad(){
    // this.http.post('UserInfo/DownloadRecording',{},{params:{FileName:fileName[0].FileName}})
    // .subscribe((data:any)=>{
    //   if(data.status==1){
    //     var a = document.createElement('a');
    //     document.body.appendChild(a);
    //     a.setAttribute('style', 'display:none');
    //     a.setAttribute('href', data.data);
    //     a.setAttribute('download', fileName[0].FileName);
    //     a.click();
    //   }else{
    //     this.message.error('出错了!');
    //   }
    //   this._loading = false;
    // },(err:any)=>{
    //   this.message.error(err.message);
    //   this._loading = false;      
    // }) 
  }

  closeTab(tab) {
    if(this.messageDetail.cxInfos.length == 1){
      this.message.info('不能删除，彩信至少有一帧!');
      return;
    }
    this.messageDetail.cxInfos.splice(tab, 1);
  }

  newTab() {
    this.messageDetail.cxInfos.push({
      PlayTime:'3',
      ImgList:'',
      VideoList:'',
      VoiceList:'',
      Words:''
    });
  }

  showCX(){
    this.isVisibleMess = true;
    this.showCxItem = Object.assign({},this.messageDetail.cxInfos[this.index]);
    console.log(this.messageDetail.cxInfos); 
    if(this.showCxItem.Img){
      this.showCxItem.ImgSrc = this.config.apiFile + this.showCxItem.Img;
    }
    if(this.showCxItem.Video){
      this.showCxItem.VideoSrc = this.config.apiFile + this.showCxItem.Video;
    }
    if(this.showCxItem.Voice){
      this.showCxItem.VoiceSrc = this.config.apiFile + this.showCxItem.Voice;
    }
  }

  handleOk(){
    this.isVisibleMess = false;
  }

  handleCancel(){
    this.isVisibleMess = false;

  }

}
