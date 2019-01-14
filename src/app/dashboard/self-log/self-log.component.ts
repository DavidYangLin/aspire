import { NzMessageService } from 'ng-zorro-antd';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-self-log',
  templateUrl: './self-log.component.html',
  styleUrls: ['./self-log.component.sass']
})
export class SelfLogComponent implements OnInit {
  userData:Array<any>;
  userQuery:any;
  _loading:boolean = false;
  isVisible = false;
  selectedValue = '1';

    
  page:any = {
    pageIndex:1,
    pageSize:5,
    keyWords:'',
    totalCount:0,
    sendState:null
  }

  constructor(private http:HttpClient,private message:NzMessageService) {

  }

  getTableData(){
    this.http.post('sms/SendHis',this.page).subscribe((data:any)=>{
      if(data.status == 1){
        this.userData = data.data.list;
        this.userData.map((item)=>{
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
        })
        this.page.totalCount = data.data.totalCount;
        this.page.pageIndex = data.data.pageIndex;
      }else{
        this.message.error(data.message);
      }
      this._loading = false;
    },(err:any)=>{
      this.message.error(err.message);
      this._loading = false;      
    })
  }

  ngOnInit() {
    this._loading = true;
    this.getTableData();
  }

  refreshData(){
    this._loading = true;    
    this.getTableData();
  }

}
