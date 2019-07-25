import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
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
  channel:string;
  unsubscribel:any;

  constructor(
    private http:HttpClient,
    private message:NzMessageService,
    private activateRoute:ActivatedRoute,
    private router:Router
  ) { 
    this.channel = this.activateRoute.snapshot.paramMap.get('channel');
  }

  ngOnInit() {
    this.getBalance();
  }

  getBalance(){
    this.http.post('cloudSms/Overage',{},{params:{channel:this.channel}})
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

  ngAfterViewInit(){
    this.unsubscribel = this.router.events.subscribe((event:any)=>{
      if(event instanceof NavigationEnd){
        let channel = this.activateRoute.snapshot.paramMap.get('channel');
        if(this.channel != channel){
          this.channel = channel;
          this.getBalance();
        }
      }
    })
  }

  ngOnDestroy(){
    this.unsubscribel.unsubscribe()
  }

}
