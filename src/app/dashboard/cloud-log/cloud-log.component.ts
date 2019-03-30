import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'app-cloud-log',
  templateUrl: './cloud-log.component.html',
  styleUrls: ['./cloud-log.component.sass']
})
export class CloudLogComponent implements OnInit {
  userData:Array<any>;
  userQuery:any;
  _loading:boolean = false;
  isVisible = false;
  selectedValue = '';

    
  page:any = {
    pageIndex:1,
    pageSize:5,
    keyWords:'',
    totalCount:0
  }
  constructor(
    private http:HttpClient,
    private message:NzMessageService
  ) { }

  ngOnInit() {
    this._loading = true;
    this.getTableData();
  }

  getTableData(){
    this.http.post('cloudSms/CloudSmsLog',this.page)
    .subscribe((data:any)=>{
      if(data.status==1){
        this.userData = data.data.list;
        this.page.pageIndex = data.data.pageIndex;
        this.page.totalCount = data.data.totalCount;
      }else{
        this.message.error('出错了!');
      }
      this._loading = false;
    },(err:any)=>{
      this.message.error(err.message);
    })
  }

  refreshData(){

  }

}
