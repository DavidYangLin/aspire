import { NzMessageService } from 'ng-zorro-antd';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-time-set',
  templateUrl: './time-set.component.html',
  styleUrls: ['./time-set.component.sass']
})
export class TimeSetComponent implements OnInit {

  userForm: FormGroup
  _loading:boolean = false;
  arr:Array<any> = [];
  constructor(private fb:FormBuilder,private http:HttpClient,private message:NzMessageService) { 
    this.userForm = this.fb.group({
      day: [ null, [ Validators.required ] ],
      threeDay:[null,[Validators.required]],
      week:[null,[Validators.required]],
      twoWeek:[null,[Validators.required]],
    })
  }


  ngOnInit() {
    this.getTableData();
  }
  
  save(){
    this._loading = true;
    let flag:boolean = false;
    for (const i in this.userForm.controls) {
      this.userForm.controls[ i ].markAsDirty();
      this.userForm.controls[ i ].updateValueAndValidity();
      if(this.userForm.controls [i].invalid){
        flag = true;
      }
    }
    if(flag){
      return;
    }
    let returnData = this.userForm.getRawValue();
    let returnList = [{
      id:'d42439c3-7936-4535-a40b-28c3a6925c61',
      value:returnData.day,
      name:'一天'
    },{
      id:'5b5c5e3a-2375-4a27-850b-f7eee0867b68',
      value:returnData.threeDay,
      name:'近三天'
    },{
      id:'7433ec3e-25b1-4217-aa9d-815c09d128bb',
      value:returnData.week,
      name:'一周'
    },{
      id:'c7e131ef-164e-4202-954c-70a1937f48fe',
      value:returnData.twoWeek,
      name:'近两周'
    }]
    this.http.post('sms/UpdateOptionData',returnList)
    .subscribe((data:any)=>{
      if(data.status==1){ 
        this._loading = true;
        this.getTableData();
        this.message.success('修改成功!');
      }else{
        this.message.error('出错了!');
      }
      this._loading = false;
    },(err:any)=>{
      this._loading = false;
      this.message.error(err.message);
    })
  }

  getTableData(){
    this.http.post('sms/GeteOptionData',{})
    .subscribe((data:any)=>{
      if(data.status==1){
        for(var i in data.data){
          if(data.data[i].id=='d42439c3-7936-4535-a40b-28c3a6925c61'){
            this.userForm.setControl('day',new FormControl(data.data[i].value,[Validators.required]));
          }
          if(data.data[i].id=='5b5c5e3a-2375-4a27-850b-f7eee0867b68'){
            this.userForm.setControl('threeDay',new FormControl(data.data[i].value,[Validators.required]));            
          }
          if(data.data[i].id=='7433ec3e-25b1-4217-aa9d-815c09d128bb'){
            this.userForm.setControl('week',new FormControl(data.data[i].value,[Validators.required]));            
          }
          if(data.data[i].id=='c7e131ef-164e-4202-954c-70a1937f48fe'){
            this.userForm.setControl('twoWeek',new FormControl(data.data[i].value,[Validators.required]));            
          }
        }
        this._loading = true;
      }else{
        this.message.error('出错了!');
      }
    },(err:any)=>{
      this.message.error(err.message);
    })
  }

}
