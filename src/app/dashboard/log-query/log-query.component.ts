import { ConfigService } from './../../model/config';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NzMessageService } from 'ng-zorro-antd';
import * as _ from 'lodash';
@Component({
  selector: 'app-log-query',
  templateUrl: './log-query.component.html',
  styleUrls: ['./log-query.component.scss']
})
export class LogQueryComponent implements OnInit {
  userData:Array<any>;
  userQuery:any;
  _loading:boolean = false;
  isVisible = false;
  selectedValue = '';

    
  page:any = {
    pageIndex:1,
    pageSize:5,
    keyWords:'',
    totalCount:0,
    sendState:'3'
  }

  constructor(private http:HttpClient,private message:NzMessageService,private config:ConfigService) {
    this.userQuery = {
      pageIndex:1,
      totalCount:10,
    }
  }

  ngOnInit() {
    this._loading = true;
    this.getTableData();
  }

  getTableData(){
    //this.http.request('POST','userInfo/UserList',{body:{...this.page}})
    var obj = _.cloneDeep(this.page);
    if(this.page.sendState == '3'){
      obj.sendState = null;
    }
    this.http.post('sms/SmsTask',obj)
    .subscribe((data:any)=>{
      if(data.status==1){
        this.userData = data.data.list;
        this.userData.map((item=>{
          if(item.sendState == '0'){
            item.sendStateText = '已提交'
          }else if(item.sendState == '1'){
            item.sendStateText = '已审核' 
          }else if(item.sendState == '2'){
            item.sendStateText = '已发送'
          }
          if(item.smsType == '0'){
            item.smsTypeText = '文字短信'
          }else if(item.smsType == '1'){
            item.smsTypeText = '图文短信'
          }else if(item.smsType == '2'){
            item.smsTypeText = '视频短信'
          }else if(item.smsType == '3'){
            item.smsTypeText = '霸信'
          }else if(item.smsType == '4'){
            item.smsTypeText = '闪信'
          }
        }))
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

  passMessage(id:any){
    this.http.post('sms/ChangeSendState','',{params:{smsTaskId:id,sendState:'2'}})
    .subscribe((data:any)=>{
      if(data.status==1){
        this.message.success('发送成功!');
        this.getTableData();
      }else{
        this.message.error('出错了!');
      }
    },(err:any)=>{
      this.message.error(err.message);
    })
  }

  refreshData(){
    this._loading = true;
    this.getTableData();
  }

  query(){
    this._loading = true;    
    this.getTableData();
  }

  downPhoneNumber(id:any){
    this.http.post('sms/SeeUpTel',{},{params:{smsTaskId:id}})
    .subscribe((data:any)=>{
      if(data.status == 1){
        this.message.success('下载成功!');
        var a = document.createElement('a');
        document.body.appendChild(a);
        a.setAttribute('style', 'display:none');
        a.setAttribute('href', this.config.apiFileUrl + data.data);
        a.setAttribute('download', '电话号码');
        a.click();
        //window.URL.revokeObjectURL(objectUrl);
      }else{
        this.message.error(data.message);
      }
    },(err:any)=>{
      this.message.error(err.message);
    })
  }

  deleteData(id:any){
    this._loading = true;
    this.http.post('sms/DeleteSendHis','',{params:{id:id}})
    .subscribe((data:any)=>{
      if(data.status==1){
        this.message.success('删除成功!');
        this.getTableData();
      }else{
        this.message.error('出错了!');
      }
    },(err:any)=>{
      this.message.error(err.message);
    })
  }
  cancel(){

  }
}
