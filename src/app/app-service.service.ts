import { ConfigService } from './model/config';
import { CookieService } from 'ngx-cookie-service';
import { Injectable, Inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpClient,
  HttpErrorResponse
} from '@angular/common/http';
import { NzMessageService } from 'ng-zorro-antd';
import { Router } from '@angular/router';
import { Observable,Subject, of, throwError } from 'rxjs';
import { map, mergeMap, catchError, take, filter } from 'rxjs/operators';

@Injectable()
export class UserService {
  constructor(private _cookie: CookieService) { }

  getToken() {
    // console.log(JSON.parse(this._cookie.get('userInfo')));
    return this._cookie.get('userInfo') && JSON.parse(this._cookie.get('userInfo'))['token'] || '';
  }

  getUserId() {
    return this._cookie.get('userInfo') && JSON.parse(this._cookie.get('userInfo'))['userId'] || '';
  }

  getMenus() {
    return this._cookie.get('userInfo') && this._cookie.get('userInfo')['menus'];
  }

  getUserInfo() {
    return this._cookie.get('userInfo') && JSON.parse(this._cookie.get('userInfo')) || '';
  }

  removeUserInfo(){
    this._cookie.delete('userInfo');
  }

  isGpmAdmin(){
    let info = this._cookie.get('userInfo') && JSON.parse(this._cookie.get('userInfo')) || '';
    if(info){
      for(let i = 0;i < info.roles.length;i++){
        if(info.roles[i] == "GPM_ADMINS"){
          return true;
        }
      }
      return false;
    }
    return false;
  }

}

/**
 * 
 * 请求拦截器
 * @export
 * @class JwtInterceptorService
 * @implements {HttpInterceptor}
 */
@Injectable()
export class JwtInterceptorService implements HttpInterceptor {
  constructor(private _user: UserService, private config: ConfigService, private router: Router, private _msg: NzMessageService, private _cookie: CookieService) { }
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let isFile = req.url.indexOf('File');
    var url = isFile == -1 ? this.config.apiUrl + req.url : this.config.apiFileUrl + req.url;
    var obj = {};
    if(this._user.getToken()){
      obj['Authorization'] = this._user.getToken();
    }
    if(this._user.getUserId()){
      obj['UserId'] = this._user.getUserId();
    }
    req = req.clone({ 
      setHeaders: obj,
      url: isFile == -1 ? this.config.apiUrl + req.url : this.config.apiFileUrl + req.url
    });

    return next.handle(req)
    .pipe(
      map((event:any)=>{
        if(event instanceof HttpResponse){
          if(event.status === 200){
            return event;
          }
          return event;
        }
      }),
      catchError((err:any)=>{
        if (err instanceof HttpErrorResponse) {
          if (err.status === 401) {
            //this._msg.error('服务器认证失败，请重新登陆!',{ nzDuration: 5000 });
            this.router.navigate(['login']);
            this._user.removeUserInfo();
          }
          if (err.status === 403) {
            this._msg.error('你没有权限访问', { nzDuration: 5000 });
            this.router.navigate(['login']);
            this._user.removeUserInfo();            
          }
          if (err.status === 500) {
            this._msg.error(err.error.message || '服务器错误', { nzDuration: 5000 });
          }
          if (err.status === 0) {
            this._msg.error(err.error.message || '服务器错误', { nzDuration: 5000 });
          }
          return throwError(err.error);
        }
        if (err instanceof Error) {
          this._msg.error('服务器连不上了,请稍后访问', { nzDuration: 5000 });
          return throwError(err);
          
        }
      }));
  }
}

@Injectable({
  providedIn: 'root'
})
export class AppServiceService {

  constructor() { }
}
//下载文件服务
@Injectable()
export class downLoadService {
  private data: any;
  private loadingId: any;
  constructor(private _msg: NzMessageService, private http: HttpClient, private user: UserService) {

  }

  downLoadTemplate(data: any) {
    this.data = data;
    this.createBasicMessage();
    let url = '';
    let params;
    if (this.data['isExport']) {
      url = 'FileGplm/ExportReport'
      params = {
        editId: this.data['editId'],
        examId: this.data['examId'],
        templateType: this.data['type']
      }
    } else {
      url = 'FileGplm/DownTemplate';
      params = {
        examId: this.data['examId'],
        TemplateType: this.data['type']
      }
    }
    this.http.post(url, {}, {
      headers: {
        Authorization: this.user.getToken()
      },
      observe: 'events',
      params: params,
      responseType: "blob"
    }).subscribe((res: any) => {
      // .jpg,.pdf,.doc,.xls,.jpeg,.png
      let fileName;
      if (res instanceof HttpResponse) {
        fileName = decodeURI(res['headers'].get('x-filename'))
        let extArray = fileName.split('.');
        let ext = extArray[extArray.length - 1];
        let type
        if (ext == "doc") {
          type = "application/msword"
        }

        if (ext == "docx") {
          type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        }

        if (type == "") {
          this._msg.info('不支持下载');
          this._msg.remove(this.loadingId);
          return;
        }
        var blob = new Blob([res.body], { type: type });
        var objectUrl = window.URL.createObjectURL(blob);
        //var test = new ByteArrayInputStream(imgByte);ByteArray
        //判断是否是IE环境下下载文件objectUrl.indexOf(location.host)<0
        if (window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveOrOpenBlob(blob, fileName);
        } else {
          var a = document.createElement('a');
          document.body.appendChild(a);
          a.setAttribute('style', 'display:none');
          a.setAttribute('href', objectUrl);
          a.setAttribute('download', fileName);
          a.click();
          window.URL.revokeObjectURL(objectUrl);
        }
        this._msg.remove(this.loadingId);
        this._msg.success('下载成功');
      }
    }, (err) => {
      var blob = new Blob([err.error], { type: 'text/plain' });
      var reader:any = new FileReader();
      reader.readAsText(blob, 'utf-8');
      reader.onload = (e) => {
        this._msg.error(JSON.parse(reader.result)['message']);
      }
      this._msg.remove(this.loadingId);
    });
  }

  downLoadFile(data: any) {
    this.data = data;
    if (!this.data) {
      this._msg.error('下载失败!')
      return;
    }
    this.createBasicMessage();
    this.http.post("FileGplm/DownFile", {}, {
      headers: {
        Authorization: this.user.getToken()
      },
      observe: 'events',
      params: {
        id: this.data['FileId']
      },
      responseType: "blob"
    }).subscribe(res => {

      if (res && res.type == 0)
        return;
      // .jpg,.pdf,.doc,.xls,.jpeg,.png
      if (res instanceof HttpResponse) {
        let extArray = this.data.FileName.split('.');
        let ext = extArray[extArray.length - 1];
        let type
        if (ext == "jpg") {
          type = "jpg"
        }
        if (ext == "jpeg") {
          type = "jpeg"
        }
        if (ext == "png") {
          type = "png"
        }
        if (ext == "pdf") {
          type = "application/pdf"
        }
        if (ext == "doc") {
          type = "application/msword"
        }

        if (ext == "docx") {
          type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        }
        if (ext == "xls") {
          type = "application/vnd.ms-exceld"
        }
        if (ext == "xlsx") {
          type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        }
        if (type == "") {
          this._msg.info('不支持下载');
          this._msg.remove(this.loadingId);
          return;
        }
        var blob = new Blob([res['body']], { type: type });
        var objectUrl = URL.createObjectURL(blob);
        if (window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveOrOpenBlob(blob, this.data.FileName);
        } else {
          var a = document.createElement('a');
          document.body.appendChild(a);
          a.setAttribute('style', 'display:none');
          a.setAttribute('href', objectUrl);
          a.setAttribute('download', this.data.FileName);
          a.click();
          URL.revokeObjectURL(objectUrl);
        }
        this._msg.remove(this.loadingId);
        this._msg.success('下载成功');
      }
    }, (err) => {
      var blob = new Blob([err.error], { type: 'text/plain' });
      var reader:any = new FileReader();
      reader.readAsText(blob, 'utf-8');
      reader.onload = (e) => {
        this._msg.error(JSON.parse(reader.result)['message']);
      }
      this._msg.remove(this.loadingId);
    });
  }

  downLoadZip(data: any) {
    this.data = data;
    if (!this.data) {
      this._msg.error('下载失败!')
      return;
    }
    this.createBasicMessage();
    this.http.post("FileGplm/DownFiles", {}, {
      headers: {
        Authorization: this.user.getToken()
      },
      observe: 'events',
      params: {
        editId: this.data.editId,
        type:this.data.type
      },
      responseType: "blob"
    }).subscribe(res => {
      if (res && res.type == 0)
        return;
      // .jpg,.pdf,.doc,.xls,.jpeg,.png
      if (res instanceof HttpResponse) {
        var blob = new Blob([res['body']], { type: 'application/zip' });
        var objectUrl = URL.createObjectURL(blob);
        if (window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveOrOpenBlob(blob, this.data.fileName);
        } else {
          var a = document.createElement('a');
          document.body.appendChild(a);
          a.setAttribute('style', 'display:none');
          a.setAttribute('href', objectUrl);
          a.setAttribute('download', this.data.fileName);
          a.click();
          URL.revokeObjectURL(objectUrl);
        }
        this._msg.remove(this.loadingId);
        this._msg.success('下载成功');
      }
    }, (err) => {
      var blob = new Blob([err.error], { type: 'text/plain' });
      var reader:any = new FileReader();
      reader.readAsText(blob, 'utf-8');
      reader.onload = (e) => {
        this._msg.error(JSON.parse(reader.result)['message']);
      }
      this._msg.remove(this.loadingId);
    });
  }

  private createBasicMessage() {
    this.loadingId = this._msg.loading('正在下载文件', { nzDuration: 0 }).messageId;
  }
}

interface BroadcastEvent {
  key: any;
  data?: any;
}

/**
 * 
 * 事件订阅-基于RxJS Subject
 * @export
 * @class Broadcaster
 * example:
  @Component({
      selector: 'child'
  })
  export class ChildComponent {
    constructor(private broadcaster: Broadcaster) {}
    
    registerStringBroadcast() {
      this.broadcaster.on<string>('MyEvent')
        .subscribe(message => {
          ...
        });
    }

    emitStringBroadcast() {
      this.broadcaster.broadcast('MyEvent', 'some message');
    }
  }
 */
@Injectable()
export class Broadcaster {
  private _eventBus: Subject<BroadcastEvent>;

  constructor() {
    this._eventBus = new Subject<BroadcastEvent>();
  }

  broadcast(key: any, data?: any) {
    this._eventBus.next({ key, data });
  }

  on<T>(key: any): Observable<T> {
    return this._eventBus.asObservable()
    .pipe(
      filter((event:any) => event.key === key),
      map((event:any) => <T>event.data)
    )
  }
}