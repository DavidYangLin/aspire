import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild, ElementRef, Sanitizer } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd';
import { ConfigService } from '../model/config';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-message-detail',
  templateUrl: './message-detail.component.html',
  styleUrls: ['./message-detail.component.scss']
})
export class MessageDetailComponent implements OnInit {

  @ViewChild('img') img:ElementRef;
  content:any;
  id:any;
  type:any;
  filePath:any;
  title:any;

  constructor(private http:HttpClient,private route:ActivatedRoute,private message:NzMessageService,private config:ConfigService,private domsanitizer:DomSanitizer) {
    this.id = this.route.snapshot.paramMap.get('id');
    this.type = this.route.snapshot.paramMap.get('type');
   }

  ngOnInit() {
    this.getDetail();
  }

  getDetail(){
    this.http.post('sms/SeeSmsDetail',{},{params:{smsTaskId:this.id}})
    .subscribe((data:any)=>{
      if(data.status == 1){
        this.content = data.data.contents;
        if(this.type == '1'){
          this.content = this.domsanitizer.bypassSecurityTrustHtml(this.content);
        }
        this.filePath = this.config.apiFile + data.data.filePath; 
        this.title = data.data.title;
      }else{
        this.message.error(data.message); 
      }
    },(err:any)=>{
      this.message.error(err.message);
    })
  }
  downLoad(){
    var a = document.createElement('a');
    document.body.appendChild(a);
    a.setAttribute('style', 'display:none');
    a.setAttribute('href', this.filePath);
    a.setAttribute('download', '电话号码');
    a.click();
  }

}
