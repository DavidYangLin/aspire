
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable() 
export class ConfigService { 
    // apiUrl = 'http://localhost:6234/api/services/GPLM/';
    // apiFileUrl= 'http://localhost:6234/api/';
    // apiUrl = environment.apiUrl;
    // apiFileUrl= environment.apiFileUrl;
    // apiUrl = 'https://aspire.w7w.cn/api/services/app/';
    // apiFileUrl= 'https://aspire.w7w.cn/';
    // apiFile = 'https://aspire.w7w.cn';

    apiUrl = 'http://api.zj-zcjd.com/api/services/app/';
    apiFileUrl= 'http://api.zj-zcjd.com/';
    apiFile = 'http://api.zj-zcjd.com';
    
    // apiUrl = 'https://aspire.w7w.cn/api/services/app/';
    // apiFileUrl= 'https://aspire.w7w.cn/';
    // apiFile = 'https://aspire.w7w.cn';


    // apiUrl = 'http://localhost:6234/api/services/app/';
    // apiFileUrl= 'http://localhost:6234/';
    // apiFile = 'http://localhost:6234';  
    // 121.40.21.23:9090
    // 114.55.237.129:9021
    // apiUrl=environment.production==true?'http://114.55.237.129:9021/api/services/GPLM/':'http://test.gplm.com/api/services/GPLM/';
    // apiFileUrl=environment.production==true?'http://114.55.237.129:9021/api/':'http://test.gplm.com/api/';//上传文件
    bussinessId = "E9ACC168-902A-4799-B828-E30BBC89E503";
    userRoles = { 
        Users: 'Users',
        GPMADMINS:  'GPM_ADMINS',
        GPMORGANIZATION: 'GPM_ORGANIZATION',  
        GPMENTERPRISE: 'GPM_ENTERPRISE',
        GPMCOMPTROLLER: 'GPM_COMPTROLLER',
        GPMSTATISTICIAN: 'GPM_STATISTICIAN'
    };
    errorDic={}; 
    authApiArr = ['GetFillInId','ExamGroupTree','LoadFillInExamQuestion','SubmitFillInResult','GetFillInRemark','FillInRemark','GetFillHelpUsers','SaveSend','GetEndTime','SetEndTime','SendEmail','SubmitExam','ToSubmitExam','GetReviewOpinion','SaveReviewOpinion','SaveExamTemplate','SendBack','GetConlusionOpinions','SelfPreview','CompleteReview','SaveReviewConlusion','AgainGetFillInId']
    backUrl = {
        user: {
            login: 'user/Login',
            loginOut: 'user/LoginOut',
            register: 'user/Register',
            forgetPassWord: 'user/ForgetPassWord',
            forgetPassWordUrl: 'user/ForgetPassWordUrl',
            resetPassWordForget: 'user/ResetPassWordForget',
        },
        userOperationLog: {
            Write: 'userOperationLog/Write',
            Query: 'userOperationLog/Query'
        },
        sysData: {
            getChildNodes: "sysData/GetChildNodes"
        },
        item: {
            QueryList: 'item/ItemList',
            UpdateItem: 'item/UpdateItem',
            DeleteItem: 'item/LogicDeleteItem',
            DeleteField:'item/LogicDeleteField',
            AddItem: 'item/AddItem',
            getItemField: 'item/FieldList',
            publishItem: 'item/Publish',
            getItemDeatil: 'item/ItemById'
        },
        exam: {
            QueryList: 'exam/ExamList',
            AddExam: 'exam/InsertExam',
            UpdateExam: 'exam/UpdateExam',
            DeleteExam: 'exam/DeleteExam',
            GetExamById: 'exam/ExamById'
        }
    }
    formatAddress(data: [any]) {
        return data.map((value) => {
            return {
                value: value['code'],
                label: value['name'],
                isLeaf: (value['regionLevel'] === 3 || value['code'] === '820000' || value['code'] === '710000' || value['code'] === '810000') ? true : false
            }
        })
    }
    helper={ 
        isDate:(strInputDate) =>{
            if (strInputDate == "") return false;
            strInputDate = strInputDate.replace(/-/g, "/");
            var d = new Date(strInputDate);
            if (isNaN(parseInt(d.toString()))) return false;
            var arr = strInputDate.split("/");
            return ((parseInt(arr[0], 10) == d.getFullYear()) && (parseInt(arr[1], 10) == (d.getMonth() + 1)) && (parseInt(arr[2], 10) == d.getDate()));
        },
        isYear: function(str) {
            var re = /^([0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3})$/;
            if (re.test(str)) {
                return true;
            } else {
                return false;
            }
        },
        isEmail: function(email) {
            var re = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/;
            if (re.test(email)) {
                return true;
            } else {
                return false;
            }
        },
        isPositiveInt: function(number) {
            var re = /^\d+$/;
            if (re.test(number)) {
                return true;
            } else {
                return false;
            }
        },
        isPositiveIntAndZero: function(number) {
            var re = /^\d+$/;
            if(number==0)
                return true;
            if (re.test(number)) {
                return true;
            } else {
                return false;
            }
        },
        isNumber: function(number) {
            var re = /^(-?\d+)(\.\d+)?$/;
            if (re.test(number)) {
                return true;
            } else {
                return false;
            }
        },
        isNumberAndZero:function(number){
            if(number==0)
                return true;
            var re = /^(-?\d+)(\.\d+)?$/;
            if (re.test(number)) {
                return true;
            } else {
                return false;
            }
        },
        isInt:function(number){
            return number%1 === 0;
        },
        isPositiveNumber: function(number) {
            if (number == 0)
                return true;
            var re = /^(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*))$/;
            if (re.test(number)) {
                return true;
            } else {
                return false;
            }
        },
        isTelPhone: function(Telphone) {
            var re = /^0\d{2,3}-?\d{7,8}$/;
            if (re.test(Telphone)) {
                return true;
            } else {
                return false;
            }
        },
        isMobilePhone: function(Mobilephone) {
            var re = /^1\d{10}$/;
            if (re.test(Mobilephone)) {
                return true;
            } else {
                return false;
            }
        },
        isValidString: function(str) {
            var re = /^[a-zA-Z_][a-zA-Z0-9_]*$/g;
            if (re.test(str)) {
                return true;
            } else {
                return false;
            }
        },
        isStrongPass: function(pass) {
    
            if (pass.length < 8) {
                return 0;
            }
            var ls = 0;
            if (pass.match(/([a-z])+/)) {
                ls++;
            }
            if (pass.match(/([0-9])+/)) {
                ls++;
            }
            if (pass.match(/([A-Z])+/)) {
    
                ls++;
    
            }
            if (pass.match(/[^a-zA-Z0-9]+/)) {
                ls++;
            }
            return ls > 3;
        },
        isUrl: function(url) {
            //在JavaScript中，正则表达式只能使用"/"开头和结束，不能使用双引号 
            var Expression = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
            var objExp = new RegExp(Expression);
            if (url.indexOf("localhost")) {
                url = url.replace("localhost", "127.0.0.1");
            }
            if (objExp.test(url) == true) {
                return true;
            } else {
                return false;
            }
        }
    }
}