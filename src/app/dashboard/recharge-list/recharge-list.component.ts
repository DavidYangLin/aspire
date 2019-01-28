import { HttpClient } from '@angular/common/http';
import { UserService } from './../../app-service.service';
import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'app-recharge-list',
  templateUrl: './recharge-list.component.html',
  styleUrls: ['./recharge-list.component.sass']
})
export class RechargeListComponent implements OnInit {
  isAdmin:boolean = false;
  userData:Array<any> = new Array<any>();
  _loading:boolean = false;
  page:any = {
    // flag:1,
    pageIndex:1,
    pageSize:5,
    keyWords:'',
    // totalCount:0,
    // agentUserId:''
  }
  
  constructor(
    private user:UserService,
    private http:HttpClient,
    private message:NzMessageService
  ) { 
    if(this.user.getUserInfo()&&this.user.getUserInfo().roles.indexOf('admin')!=-1){
      this.isAdmin = true;
    }
    this.userData = [{
      test1:'das',
      test2:'212',
      test3:'212',
      test4:'212',
      test5:'212',
    }]
  }

  ngOnInit() {
    this.getTableData();
  }

  getTableData(){
    this.http.post('sms/RechargeOrderPage',this.page)
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

  setRehcargeStatus(id:any,status:any){
    this.http.post('sms/EditRechargeStatus',{id:id,status:status})
    .subscribe((data:any)=>{
      if(data.status==1){
        if(status == '1'){
          this.message.success('为用户充值成功，请确保已为用户账户充值!')
        }else{
          this.message.success('用户充值失败!');
        }
      }else{
        this.message.error('出错了!');
      }
      this._loading = false;
    },(err:any)=>{
      this.message.error(err.message);
      this._loading = false;      
    })
  }

  refreshData(){
    
  }

}
