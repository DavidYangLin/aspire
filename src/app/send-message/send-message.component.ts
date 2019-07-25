import { ConfigService } from './../model/config';
import { HttpClient, HttpRequest, HttpParams, HttpResponse } from '@angular/common/http';
import { UploadXHRArgs, NzMessageService, UploadFile } from 'ng-zorro-antd';
import { Component, OnInit, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { fromEvent } from 'rxjs';
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
  radioValue:string='2'
  location:Array<any> = [];
  inputFile:any;
  batchCount:number = 0;
  progressCount:number = 0;
  progressVisible:boolean = false;
  batchFlag:string;
  // phoneNumberObj:any = {};
  unsubscribe:Array<any> = [];
  messageObj:any;
  test1:any = {
    background:'none'
  }

  constructor(
    private http:HttpClient,
    private message:NzMessageService,
    private route:ActivatedRoute,
    private router:Router,
    private config:ConfigService,
    private elementRef:ElementRef
  ) { 
    this.id = this.route.snapshot.paramMap.get('id');
    this.type = this.route.snapshot.paramMap.get('type');

  }

  ngOnInit() {

  }

  guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
  }

  ngAfterViewInit(){
    this.inputFile = this.elementRef.nativeElement.querySelector('#my_file');
    if(this.inputFile){
      this.unsubscribe.push(
        fromEvent(this.inputFile,'change').subscribe((file:any)=>{
        let a = this.inputFile.files[0].name.split('.');
        if(a[a.length - 1]!='txt'){
          this.message.info('请上传txt格式的文件');
          return;
        }
        this.messageObj = this.message.loading('正在上传文件，请稍等。。。',{nzDuration:0});
        let text = this.inputFile.files[0];
        let reader = new FileReader();
        reader.readAsText(text,"gb2312");
        reader.onload = (e:any)=>{
          let fileText = e.target.result;
          if(fileText.length == 0){
            this.message.info('导入的数据无效!')
            return;
          }
          let arr = fileText.split('\n');
          if(arr.length % 10000 == 0){
            this.batchCount = parseInt((arr.length / 10000).toString())
          }else{
            this.batchCount = parseInt((arr.length / 10000).toString()) + 1;
          }
          this.progressCount = 0;
          this.batchFlag = this.guid();
          for(var i = 0;i < this.batchCount;i++){
            var temp = arr.splice(0,10000);
            this.importPlatTellV2(temp);
          };
          // if(arr.length % 10000 == 0){
          //   for(var i = 0;i < this.batchCount;i++){
          //     var temp = arr.splice(0,10000);
          //     this.importPlatTellV2(temp);
          //   };
          // }else{
          //   for(var i = 0;i <= this.batchCount;i++){
          //     var temp = arr.splice(0,10000);
          //     this.importPlatTellV2(temp);
          //   };
          // }
        }
      }));
    }
  }

  test(){
    this.inputFile.click();
  }

  importPlatTellV2(phoneArr){
    this.http.post('sms/ImportPlatTellV2',{taskId:this.id,batchFlag:this.batchFlag,tells:phoneArr.join(',').replace(/\s*/g,'')})
    .subscribe((data:any)=>{
      if(data.status==1){
        this.progressCount++;
        if(this.batchCount == this.progressCount){
          this.message.remove(this.messageObj.messageId);
          this.message.success('导入成功!');
          this.inputFile.value = null;
        }
      }else{
        this.message.error('出错了!');
      }
    },(err:any)=>{
      this.message.error(err.message);
    })
  }

  customReq = (item:UploadXHRArgs)=>{
    let loading:any = this.message.loading('正在上传文件，请稍等。。。',{nzDuration:0});
    this.sendFlag = true;
    const formData = new FormData();
    formData.append('file',item.file as any);
    return this.http.post('api/File/UpFile',formData,{params:{UpFlag:'4',TaskId:this.id}})
    .subscribe((event:any)=>{
      this.sendFlag = false;
      if(event.status == 1){
        this.message.remove(loading.messageId);
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
      this.message.remove(loading.messageId);
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
    let loading:any = this.message.loading('正在发送，请稍等。。。',{nzDuration:0});
    let channel
    if(this.sendType == '3'){
      channel = '1';
    }else{
      channel = '0';
    }
    this.http.post('sms/SendCloudSms',{taskId:this.id,contents:this.messageDetail.contents,channel:channel})
    .subscribe((data:any)=>{
      this.message.remove(loading.messageId);
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
    let loading:any = this.message.loading('正在发送，请稍等。。。',{nzDuration:0});
    let channel
    if(this.sendType == '3'){
      channel = '1';
    }else{
      channel = '0';
    }
    this.http.post('sms/SendCx',{taskId:this.id,channel:channel})
    .subscribe((data:any)=>{
      this.message.remove(loading.messageId);
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
        this.messageDetail.locationStr = '';
        if(this.messageDetail.pro&&this.messageDetail.pro!='不限'){
          this.messageDetail.locationStr = this.messageDetail.pro;
        }else if(this.messageDetail.pro=='不限'){
          this.messageDetail.locationStr = '全国';
        }
        if(this.messageDetail.city&&this.messageDetail.city!='不限'){
          this.messageDetail.locationStr = this.messageDetail.locationStr + '/' + this.messageDetail.city;
        }
        if(this.messageDetail.contry&&this.messageDetail.contry!='不限'){
          this.messageDetail.locationStr = this.messageDetail.locationStr + '/' +  this.messageDetail.contry;
        }
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

  loadData = (node:any,index:number):PromiseLike<any> => {
    var value;
    if(index===-1){
      value='';
    }else{
      value = node.value;
    }
    return new Promise((resolve) => {
      this.http.post('userInfo/GetRegions',{parentCode:value})
      .subscribe((data:any) => {
         node.children = this.formatAddress(data.data);
         resolve();
      });
    });
  }
  
  private formatAddress(data: [any]) {
    return data.map((value) => {
        return {
            value: value['code'],
            label: value['name'],
            // isLeaf: ((value['regionLevel'] === 3&&this.radioValue=='2') ||(value['regionLevel'] === 2&&this.radioValue=='1')||(value['regionLevel'] === 1&&this.radioValue=='0') || value['code'] === '820000' || value['code'] === '710000' || value['code'] === '810000') ? true : false
            isLeaf: ((value['regionLevel'] === 2&&this.radioValue=='2') ||(value['regionLevel'] === 1&&this.radioValue=='1')||(value['regionLevel'] === 1&&this.radioValue=='0') || value['code'] === '820000' || value['code'] === '710000' || value['code'] === '810000') ? true : false            
        }
    })
  }

}
