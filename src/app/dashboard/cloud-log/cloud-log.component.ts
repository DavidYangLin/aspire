import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
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
  channel:string;
  unsubscribel:any;

    
  page:any = {
    pageIndex:1,
    pageSize:5,
    keyWords:'',
    totalCount:0,
    channel:0
  }
  constructor(
    private http:HttpClient,
    private message:NzMessageService,
    private activateRoute:ActivatedRoute,
    private router:Router
  ) { 
    this.channel = this.activateRoute.snapshot.paramMap.get('channel');
    this.page.channel = this.channel;
  }

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

  ngAfterViewInit(){
    this.unsubscribel = this.router.events.subscribe((event:any)=>{
      if(event instanceof NavigationEnd){
        let channel = this.activateRoute.snapshot.paramMap.get('channel');
        if(this.channel != channel){
          this.channel = channel;
          this.getTableData();
        }
      }
    })
  }

  refreshData(){

  }
  ngOnDestroy(){
    this.unsubscribel.unsubscribe()
  }

}
