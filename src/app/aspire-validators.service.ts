import {ValidatorFn, AbstractControl, Validators } from '@angular/forms';



export class AspireValidators extends Validators{
    //验证邮箱
    static emailValidator(): ValidatorFn{
      return (c:AbstractControl): {[key:string]:any} =>{
        let reg = new RegExp(/^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/);
        if(c.value){
          if(reg.test(c.value)){
            return null;
          }else{
            return {'emailValidate':{value:c.value}}
          }
        }else{
          return null;
        }
      }
    }
  
    //验证截止日期
    static dateValidator():ValidatorFn{
      return (c:AbstractControl): {[key:string]:any}=>{
        let dateArr = c.value;
        if(dateArr[0]&&dateArr[1]){
          return null;
        }else{
          return {'dateValidate':c.value}
        }
  
      }
    }
  
      //验证电话号码---手机号/固定电话
    static phoneNumberValidator():ValidatorFn{
      return (c:AbstractControl): {[key:string]:any}=>{
        // let dateArr = c.value;
        let reg1 = new RegExp(/^1(3|4|5|7|8)\d{9}$/);
        let reg2 = new RegExp(/^([0-9]{3,4}-)?[0-9]{7,8}$/);
        if(c.value){
          if(reg1.test(c.value)||reg2.test(c.value)){
            return null;
          }else{
            return{'phoneNumberValidator':c.value}
          }
        }else{
          return null;
        }
  
      }
    }
    static percentValidator():ValidatorFn{
      return (c:AbstractControl): {[key:string]:any}=>{
        let reg1 = new RegExp(/^0\.\d+$/);
        if(c.value){
          if(reg1.test(c.value)||c.value == '1'){
            return null;
          }else{
            return{'percentError':c.value}
          }
        }else{
          return null;
        }
  
      }
    }
}