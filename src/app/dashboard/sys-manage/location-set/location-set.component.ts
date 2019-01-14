import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'app-location-set',
  templateUrl: './location-set.component.html',
  styleUrls: ['./location-set.component.scss']
})
export class LocationSetComponent implements OnInit {

    /** init data */
    public nzOptions = null;

    /** ngModel value */
    public values: any[] = null;
    validateForm: FormGroup;
    controlArray = [];
    isCollapse = true;
    code:Array<any>;
    isChoose:boolean = false;

    toggleCollapse(): void {
      this.isCollapse = !this.isCollapse;
      this.controlArray.forEach((c, index) => {
        c.show = this.isCollapse ? (index < 6) : true;
      });
    }
  
    resetForm(): void {
      this.validateForm.reset();
    }

  constructor(private fb: FormBuilder,private http:HttpClient,private message:NzMessageService) { }

  ngOnInit() {
    // let's set nzOptions in a asynchronous way
    this.validateForm = this.fb.group({});
  }

  public onChanges(values: any): void {
    this.code = values;
    this.getChild(values[1]);
  }

  save(){
    var returnData = {
      provinceCode:this.code[0],
      cityCode:this.code[1],
      countryList:[]
    }
    var formData = this.validateForm.value;
    for(var i in formData){
      returnData.countryList.push({
        countryCode:i,
        count:formData[i]
      })
    }
    this.http.post('UserInfo/SetRegions',returnData)
    .subscribe((data:any) => {
      if(data.status == 1){
        this.message.success('保存成功!');
      }else{
        this.message.error('出错了!');
      }
    },(err:any)=>{
      this.message.error(err.message);
    });
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
         if(index == 0){
           node.children.map(item=>{
             item.isLeaf = true;
           })
         }
         resolve();
      });
    });
  }

  private formatAddress(data: [any]) {
    return data.map((value) => {
        return {
            value: value['code'],
            label: value['name'],
            isLeaf: (value['regionLevel'] === 3 || value['code'] === '820000' || value['code'] === '710000' || value['code'] === '810000') ? true : false
        }
    })
  }
  public getChild(value:any){
    this.controlArray = [];
    this.validateForm = this.fb.group({});
    this.http.post('userInfo/GetRegions',{parentCode:value})
    .subscribe((data:any) => {
       var arr = data.data;
       for(var i = 0;i<arr.length;i++){
         var title = arr[i]['name'];
         var count = arr[i]['count'];
         var control = {
           title,
           count,
           index:arr[i]['id'],
           show:true
         }
         this.controlArray.push(control);
         this.validateForm.addControl(control.index,new FormControl(count,Validators.required))
         this.isChoose = true;
       }
    });
  }

}
