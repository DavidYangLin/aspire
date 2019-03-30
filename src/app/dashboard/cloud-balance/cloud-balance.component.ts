import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'app-cloud-balance',
  templateUrl: './cloud-balance.component.html',
  styleUrls: ['./cloud-balance.component.sass']
})
export class CloudBalanceComponent implements OnInit {

  balanceDetail:any = {};

  constructor(
    private http:HttpClient,
    private message:NzMessageService
  ) { }

  ngOnInit() {
    this.getBalance();
  }

  getBalance(){
    this.http.post('cloudSms/Overage',{})
    .subscribe((data:any)=>{
      if(data.status==1){
        this.balanceDetail = data.data;
      }else{
        this.message.error('出错了!');
      }
    },(err:any)=>{
      this.message.error(err.message);
    })
  }

}
