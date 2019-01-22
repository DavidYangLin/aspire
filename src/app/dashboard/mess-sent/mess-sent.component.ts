import { NzMessageService,UploadFile } from 'ng-zorro-antd';
import { FormGroup } from '@angular/forms';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { HttpRequest, HttpResponse, HttpClient, HttpParams } from '@angular/common/http';
import { fromEvent, Observable } from 'rxjs';
import * as _ from 'lodash';
import { ConfigService } from '../../model/config';
declare var $:any;

@Component({
  selector: 'app-mess-sent',
  templateUrl: './mess-sent.component.html',
  styleUrls: ['./mess-sent.component.scss']
}) 
export class MessSentComponent implements OnInit {
  @ViewChild('scrollDiv') scrollDiv:ElementRef;

  selectedSex:any = '2';
  selectedAge:Array<any> = ['5'];
  selectedApp:any;
  selectedKey:any;
  selectedType:any = '0';
  selectedTime:any = 'd42439c3-7936-4535-a40b-28c3a6925c61';
  arr:Array<any> = [];
  inputFile:any;
  unsubscribe:Array<any> = [];
  isSpinning:boolean = false;
  radioValue:any = '0';
  $summernote:any;
  title:any;

  isloadNumber:boolean = false;

  locationData:Array<any> = [];
  selectCity:Array<any> = [];
  selectCountry:Array<any> = [];

  fileList: UploadFile[] = [];
  phoneNumber:Array<any> = [];
  phoneNumberTxt:any;
  acceptType = {
    txt:".txt",
    video:'.mp4,.vga,.avi,.wmv,.mkv,.flv',
    img:'.png,.jpg,.jpeg'
  }
  sendCount:number = 0;
  sendContent:any;
  dataLabelCount:number = 0;
  filePath:any;
  appPermission:boolean = false;
  keyPermission:boolean = false;
  minNumber:number = 100000;
  btnLoading:boolean = false;

  page:any = {pageIndex:1,pageSize:1000,totalCount:10000}

  appOptions:Array<any> = [{value:'1',label:'装修行业'},{value:'2',label:'美容行业'}]
  listOfAppOption = [];
  keyOptions:Array<any> = [{value:'1',label:'装修行业'},{value:'2',label:'美容行业'}]
  listOfKeyOption = [];
  multipleValueApp:Array<any> = [];
  multipleValueKey:Array<any> = [];
  isLoadEnd:boolean = false;
  importPhone:Array<any> = [];
  importNumber:number = 0;
  
  public nzOptions = null;
  public location: any[] = null;

  validateForm: FormGroup;
  constructor(private http:HttpClient,private message:NzMessageService,private elementRef:ElementRef,private config:ConfigService) { 
  }

  ngOnInit() {
    this.getApp(false);
    this.getApp(true);
    this.getPermission();
    const children = [];
    for (let i = 10; i < 36; i++) {
      children.push({ label: i.toString(36) + i, value: i.toString(36) + i });
    }
    this.listOfAppOption = children;
  }

  getData(){
    if(this.page.totalCount < this.minNumber){
      this.message.info('请至少发送'+this.minNumber+'条短信');
      return;
    }
    this.http.post('sms/MobliePhone','',{params:{
      pageIndex:this.page.pageIndex.toString(),
      pageSize:this.page.pageSize.toString(),
      totalCount:this.page.totalCount.toString()
    }})
    .subscribe((data:any)=>{
      if(data.status == 1){
        this.arr.push(...data.data.list);
        this.page.pageIndex++;
        this.page.totalCount = data.data.totalCount;
      }else{
        this.message.error('出错了!');
      }
    },(err:any)=>{
      this.message.error(err.message);
    })
  }

  validateMessCount(){
    if(this.dataLabelCount == 0){
      this.message.info('请先查询数据标签!');
      return;
    }else if(this.sendCount > this.dataLabelCount){
      this.message.info('当前导入数量大于数据标签数量，请重新输入您需要导入的号码数量!');
      return;
    }
    this.page.totalCount = this.sendCount;
    this.arr = [];
    this.isLoadEnd = false;
    this.http.post('UserInfo/GetAgentSmsCount',{})
    .subscribe((data:any)=>{
      if(data.status == 1){
        //设置最低发送数量
        this.minNumber = data.data.minNumber;
        //获取页面上发送的号码总数
        let arrPhone = [];
        if(this.phoneNumberTxt && this.phoneNumberTxt.length != 0){
          arrPhone = this.phoneNumberTxt.split(',');
          _.uniq(arrPhone);
        }
        let sendCount = parseInt(this.sendCount.toString()) + parseInt(this.importNumber.toString()) + parseInt(arrPhone.length.toString()) ;
        if(this.selectedType == '0'){
          if( sendCount > data.data.textSmsCount){
            this.message.info('你的文字短信数量余额不足,请联系充值');
            return;
          } 
        }else if(this.selectedType == '1'){
          if(sendCount > data.data.imgSmsCount){
            this.message.info('你的图文短信数量余额不足,请联系充值');
            return;
          } 
        }else if(this.selectedType == '2'){
          if(sendCount > data.data.videoSmsCount){
            this.message.info('你的视频短信数量余额不足,请联系充值');
            return;
          }
        }else if(this.selectedType == '3'){
          if(sendCount > data.data.baSmsCount){
            this.message.info('你的霸信数量余额不足,请联系充值');
            return;
          } 
        }else if(this.selectedType == '4'){
          if(sendCount > data.data.sxSmsCount){
            this.message.info('你的闪信数量余额不足,请联系充值');
            return;
          }
        }
        this.arr = [];
        if(this.importNumber > 0){
          this.arr.push(...this.importPhone);
        }
        if(arrPhone.length > 0){
          this.arr.push(...arrPhone);
        }
        this.getData();
        this.isloadNumber = true;
      }else{
        this.message.error(data.message);
      }
    },(err:any)=>{
      this.message.error(err.message);
    })
  }

  ngAfterViewInit(){
    fromEvent(this.scrollDiv.nativeElement,'scroll')
    .subscribe((event:any)=>{
      var scrollTop = event.target.scrollTop;
      var viewH  = event.target.offsetHeight;
      var contentH = event.target.scrollHeight;
      if(scrollTop/(contentH -viewH)>=0.95){
        this.page.totalCount = this.sendCount;
        if(!this.isLoadEnd && this.page.totalCount / this.page.pageSize <= this.page.pageIndex){
          this.message.info('没有更多的数据了!');
          this.isLoadEnd = true;
          return;
        }
        this.getData();
      }
    })
    this.inputFile = this.elementRef.nativeElement.querySelector('#my_file');
    if(this.inputFile){
      this.unsubscribe.push(
        fromEvent(this.inputFile,'change').subscribe((file:any)=>{
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
          let reg = new RegExp(/^1(3|4|5|7|8)\d{9}$/);
          let temp = [];
          for(var i in arr){
            arr[i] = arr[i].slice(0,arr[i].length-1);
            // if(!reg.test(arr[i])){
            //   this.message.error('输入的号码不正确或格式有误，请检查');
            //   return;
            // }
            if(reg.test(arr[i])){
              temp.push(arr[i]);
            }
          }
          this.importPhone.push(...temp);
          _.uniq(this.importPhone);
          this.importNumber = this.importPhone.length;
          var temp1 = this.arr;
          this.arr = _.concat(this.importPhone,temp1);
          this.message.success('导入成功!');
        }
      }));
    }
  }

  loadPhoneNumber(){
    this.inputFile.value = '';
    this.inputFile.click();
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

  getApp(flag:any){
    this.http.post('sms/AppList',{},{params:{isKeyWord:flag}})
    .subscribe((data:any) => {
      if(data.status == 1){
        if(flag){
          this.keyOptions = data.data;
        }else{
          this.appOptions = data.data;
        }
      }else{
        this.message.error(data.message);
      }
    },(err:any)=>{
      this.message.error(err.message);
    });
  }

  appChange(value:any){
    this.multipleValueApp = [];
    this.getAppChild(value,false);
  }
  keyChange(value:any){
    this.multipleValueKey = [];
    this.getAppChild(value,true);
  }
  locationChange(value:any){
    this.location = [];
    this.selectCity = [];
    this.selectCountry = [];
  }
 
  getAppChild(id:any,flag:any){
    this.http.post('sms/AppChildList',{},{params:{industryId:id}})
    .subscribe((data:any)=>{
      if(data.status == 1){
        if(flag){
          this.listOfKeyOption = data.data;
        }else{
          this.listOfAppOption = data.data;
        }
      }else{
        this.message.error(data.message);
      }
    },(err:any)=>{
      this.message.error(err.message);
    })
  }

  messageQuery(){
    if(this.radioValue != '4' && (this.location == null || this.location.length == 0)){
      this.message.info('请先选择归属地!');
      return;
    }
    if(!this.selectedSex){
      this.message.info('请先选择性别!');
      return;
    }
    if(!this.selectedAge){
      this.message.info('请先选择年龄!');
      return;
    }
    if(!this.selectedTime){
      this.message.info('请先选择期限!');
      return;
    }
    if(this.appPermission){
      if(this.multipleValueApp.length > 0 && this.multipleValueApp.length < 5){
        this.message.info('APP应不少于5个!');
        return;
      }
    }
    if(this.keyPermission){
      if(this.multipleValueApp.length == 0&&this.multipleValueKey.length ==0){
        this.message.info('APP或关键词至少需要选择一项!');
        return;
      }
    }
    this.btnLoading = true;    
    var returnData:any = {
      sex: this.selectedSex,
      age: this.selectedAge,
      industryId: this.selectedApp,
      industryChildList: this.multipleValueApp,
      keywordId: this.selectedKey,
      keywordChildList: this.multipleValueKey,
      deadlineSet:this.selectedTime
    }
    if(this.radioValue == '0'){
      returnData.proCode = this.location[0];
    }else if(this.radioValue == '1'){
      returnData.proCode = this.location[0];
      returnData.cityCode = this.selectCity;
    }else if(this.radioValue == '2'){
      returnData.proCode = this.location[0];
      returnData.cityCode = [this.location[1]];
      returnData.contryCode = this.selectCountry;      
    }else if(this.radioValue == '4'){
      returnData.proCode = '全国';
    }
    this.http.post('sms/SearchByCon',returnData)
    .subscribe((data:any)=>{
      if(data.status == 1){
        this.isloadNumber = false;
        setTimeout(()=>{
          this.dataLabelCount = data.data;
          this.btnLoading = false;
        },2500)
      }else{
        this.message.error(data.message);
        this.btnLoading = false;        
      }
    },(err:any)=>{
      this.message.error(err.message);
      this.btnLoading = false;      
    })
  }

  sendMessage(){
    if(this.radioValue != '4' && (this.location == null || this.location.length == 0)){
      this.message.info('请先选择归属地!');
      return;
    }
    if(this.dataLabelCount==0){
      this.message.info('数据标签为0，不能发送，请先查询数据标签!');
      return;
    }
    if(!this.isloadNumber){
      this.message.info('请先导入号码!');
      return;
    }
    let arrPhone = [];
    if(this.phoneNumberTxt && this.phoneNumberTxt.length != 0){
      arrPhone = this.phoneNumberTxt.split(',');
      _.uniq(arrPhone);
    }
    let sendCount = parseInt(this.sendCount.toString()) + parseInt(this.importNumber.toString()) + parseInt(arrPhone.length.toString()) ;
    if(sendCount < this.minNumber){
      this.message.info('发送数量小于'+this.minNumber+'，不能发送!');
      return;
    }
    this.importPhone.push(...arrPhone);
    var returnData:any = {
      sex:this.selectedSex,
      age:this.selectedAge,
      industryId:this.selectedApp,
      industryChildList:this.multipleValueApp,
      keywordId: this.selectedKey,
      keywordChildList:this.multipleValueKey,
      smsType:this.selectedType,
      sendCount:this.sendCount,
      mobliePhones:this.importPhone,
      filePath:this.filePath
    }
    if(this.radioValue == '0'){
      returnData.proCode = this.location[0];
    }else if(this.radioValue == '1'){
      returnData.proCode = this.location[0];
      //returnData.cityCode = this.location[1];
      returnData.cityCode = this.selectCity[0]||'';
    }else if(this.radioValue == '2'){
      returnData.proCode = this.location[0];
      returnData.cityCode = this.location[1];
      //returnData.contryCode = this.location[2];
      returnData.contryCode = this.selectCountry[0]||'';
    }
    if(this.selectedType == '1'){
      returnData.contents = this.$summernote.summernote('code');
    }else if(this.selectedType == '0'||this.selectedType == '3'||this.selectedType == '4'){
      returnData.contents = this.sendContent;
    }
    if(!returnData.contents){
      this.message.info('请填写发送内容!');
      return;
    }
    if(this.selectedType == '1'||this.selectedType == '2'){
      returnData.title = this.title;
      if(!returnData.title){
        this.message.info('请填写标题!');
        return;
      }
    }
    this.isSpinning = true;    
    this.http.post('sms/SubmitSendTask',returnData)
    .subscribe((data:any)=>{
      if(data.status == 1){
        this.message.success('发送成功!');
      }else{
        this.message.error(data.message);
      }
      this.isSpinning = false;      
    },(err:any)=>{
      this.message.error(err.message);
      this.isSpinning = false;      
    })
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

  public onChanges(values: any): void {
    let value:any;
    if(this.radioValue == '1'){
      value = values[0];
      this.selectCity = [];
    }else if(this.radioValue == '2'){
      value = values[1];
      this.selectCountry = [];
    }
    this.http.post('userInfo/GetRegions',{parentCode:value})
    .subscribe((data:any) => {
       this.locationData = this.formatAddress(data.data);
       if(this.radioValue == '2'){
         if(this.locationData[0].label == '市辖区'){
          this.locationData.splice(0,1)
         }
       }
    });
  }

  private getLocationData(){

  }

  confirmSend(){
    //this.queryOrSend = false;
  }

  getPermission(){
    this.http.request('POST','sms/GetAppAndKeyPer',{})
    .subscribe((data:any)=>{
      if(data.status==1){
        this.appPermission = data.data.isApp;
        this.keyPermission = data.data.isKeyword;
       // this.getTableData();
      }else{
        this.message.error(data.message);
      }
    },(err:any)=>{
      this.message.error(err.message);
    })
  }

  uploader = (item: any) => {
    const formData = new FormData();
    formData.append(item.name, item.file as any);
    const req = new HttpRequest('POST',"api/File/UpFile", formData,
    {params:new HttpParams().set('UpFlag',this.selectedType)});
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
  selectChange(value:any){
    this.sendCount = 0;
    this.arr = [];
    if(this.selectedType=='1'){
      this.$summernote = $('#summernote').summernote({
        toolbar: [
          // [groupName, [list of button]]
          ['style', ['bold', 'italic', 'underline', 'clear']],
          ['font', ['strikethrough', 'superscript', 'subscript']],
          ['fontsize', ['fontsize']],
          ['color', ['color']],
          ['para', ['ul', 'ol', 'paragraph']],
          //['height', ['height']],
          ['Insert',['picture']]
        ],
        callbacks:{
          onImageUpload:(files) => {
            const formData = new FormData();
            formData.append(files[0].name, files[0] as any);
            const req = new HttpRequest('POST',"api/File/UpFile", formData,
            {params:new HttpParams().set('UpFlag',this.selectedType)});
            this.http.request(req).subscribe((event: any) => {
              if (event instanceof HttpResponse) {
                if (event.body.status == 1) {
                  var filePath = this.config.apiFile + event.body.data.url;
                  // $('#summernote').summernote('insertImage', filePath, event.body.data.txt);
                  $('#summernote').summernote('insertImage', filePath, function($image){
                    $image.css('width','300');
                    $image.attr('data-filename',event.body.data.txt)
                  });
                } else {
                  this.message.error(event.body.message);
                }
              }
            }, (err) => {
            })
          }
        },
        height:'300px',
        //lineHeight:10
      });
    }else{
      $('#summernote').summernote('destroy');
    }
  }
}
