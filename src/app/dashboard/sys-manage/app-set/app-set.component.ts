import { AspireValidators } from './../../../aspire-validators.service';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'app-app-set',
  templateUrl: './app-set.component.html',
  styleUrls: ['./app-set.component.scss']
})
export class AppSetComponent implements OnInit {

  constructor(private fb: FormBuilder,private message:NzMessageService,private http:HttpClient) { }
  nestedTableData = [];
  innerTableData = [];
  isVisible:boolean = false;
  appId:any;
  isCountOne:boolean = false;
  _loading:boolean = false;
  
  page:any = {
    pageIndex:1,
    pageSize:5,
    keyWords:'',
    totalCount:0
  }

  validateForm: FormGroup;
  controlArray: Array<{ id: number, controlInstance: string,idChild:string,controlInstanceChild:string }> = [];

  addField(e?: MouseEvent): void {
    if (e) {
      e.preventDefault();
    }
    const id = (this.controlArray.length > 0) ? this.controlArray[ this.controlArray.length - 1 ].id + 1 : 0;
    var idChild = id+'Child'
    const control = {
      id,
      idChild,
      controlInstance: `passenger${id}`,
      controlInstanceChild:`passenger${idChild}`
    };
    const index = this.controlArray.push(control);
    this.validateForm.addControl(this.controlArray[ index - 1 ].controlInstance, new FormControl(null, Validators.required));
    this.validateForm.addControl(this.controlArray[ index - 1 ].controlInstanceChild, new FormControl(null, [Validators.required,AspireValidators.percentValidator()]));
    
  }

  removeField(i: { id: number, controlInstance: string,idChild:string,controlInstanceChild:string }, e: MouseEvent): void {
    e.preventDefault();
    if (this.controlArray.length > 1) {
      const index = this.controlArray.indexOf(i);
      this.controlArray.splice(index, 1);
      this.validateForm.removeControl(i.controlInstance);
      this.validateForm.removeControl(i.controlInstanceChild);
    }
  }

  getFormControl(name: string): AbstractControl {
    return this.validateForm.controls[ name ];
  }

  submitForm(): void {
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[ i ].markAsDirty();
      this.validateForm.controls[ i ].updateValueAndValidity();
    }
  }

  ngOnInit(): void {
    this._loading = true;
    this.validateForm = this.fb.group({
      pControlInstance: [ null, [ Validators.required ] ],
      pControlInstanceChild: [ null, [ Validators.required ] ],
    });
    this.addField();
    this.getTableData();
  }

  getTableData(){
    //this.http.request('POST','userInfo/UserList',{body:{...this.page}})
    this.http.post('sms/IndustryList',{
      pageIndex:1,
      pageSize:9999,
      keyWords:'',
      isKeyWord:false
    })
    .subscribe((data:any)=>{
      if(data.status==1){
        var percent:number = 0;
        data.data.list.map((item:any)=>{
          item.count = item.textSmsCount + item.imgSmsCount + item.videoSmsCount + item.baSmsCount + item.sxSmsCount;
          percent += item.per;
        })
        percent = parseFloat(percent.toFixed(3))*1000/1000;
        if(data.data.list.length != 0 && percent != 1){
          this.isCountOne = true;
        }
        this.nestedTableData = data.data.list;
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
  
  refreshData(){

  }

  showModal(data?:any): void {
    this.isVisible = true;
    if(data){
      this.appId = data.id;
      this.validateForm = this.fb.group({
        pControlInstance: [ data.name, [ Validators.required ] ],
        pControlInstanceChild: [ data.per, [ Validators.required,AspireValidators.percentValidator() ] ],
      });
      this.controlArray = [];
      for(var i = 0;i < data.childList.length;i++){
        const id = (this.controlArray.length > 0) ? this.controlArray[ this.controlArray.length - 1 ].id + 1 : 0;
        var idChild = id+'Child'
        const control = {
          id,
          idChild,
          controlInstance: `passenger${id}`,
          controlInstanceChild:`passenger${idChild}`
        };
        const index = this.controlArray.push(control);
        this.validateForm.addControl(this.controlArray[ index - 1 ].controlInstance, new FormControl(data.childList[i].childName, Validators.required));
        this.validateForm.addControl(this.controlArray[ index - 1 ].controlInstanceChild, new FormControl(data.childList[i].per, [Validators.required,AspireValidators.percentValidator()]));
      }
    }else{
      this.appId = null;
      this.validateForm = this.fb.group({
        pControlInstance: [ null, [ Validators.required ] ],
        pControlInstanceChild: [ null, [ Validators.required,AspireValidators.percentValidator() ] ],
      });
      this.controlArray = [];
      this.addField();
    }
  }

  handleOk(): void {
    //获取表单值
    var flag = false;
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[ i ].markAsDirty();
      this.validateForm.controls[ i ].updateValueAndValidity();
      if(this.validateForm.controls[ i ].invalid){
        flag = true;
      }
    }
    if(flag){
      return;
    }
    var returnData:any = {
      isKeyWord:false,
      id:this.appId,
      name:'',
      per:'',
      childList:[]
    };
    var formDataValue = this.validateForm.value;
    var percent = 0;
    for(var i in formDataValue){
      if(i == 'pControlInstance'){
        returnData.name = formDataValue[i];
      }else if( i == 'pControlInstanceChild'){
        returnData.per = formDataValue[i];
      }else{
        if(i.match(/^passenger\d+$/)){
          returnData.childList.push({
            childName:formDataValue[i],
            per:formDataValue[i+'Child']
          })
          percent += parseFloat(formDataValue[i+'Child']);
        }
      }
    }
    percent = parseFloat(percent.toFixed(3))*1000/1000;
    if(percent != 1){
      this.message.info('子行业比例总和不为1,请重新设置!');
      return;
    }
    this.http.post('sms/AddOrUpdateIndustry',returnData)
    .subscribe((data:any)=>{
      if(data.status==1){
        this._loading = true;
        this.getTableData();
        this.message.success('添加成功!');
      }else{
        this.message.error('出错了!');
      }
      this.isVisible = false;      
    },(err:any)=>{
      this.message.error(err.message);
    })
  }

  handleCancel(): void {
    this.isVisible = false;
  }

  cancel(): void {
  }

  confirm(id:any): void {
    this.http.post('sms/DeleteIndustry','',{params:{id:id}})
    .subscribe((data:any)=>{
      if(data.status == 1){
        this._loading = true;
        this.getTableData();
        this.message.success('删除成功!');
      }else{
        this.message.error('出错了!');
      }
    },(err:any)=>{
      this.message.error(err.message);
    })
  }
}
