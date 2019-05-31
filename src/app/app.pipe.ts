import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'app'
})
export class AppPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    return null;
  }

}

@Pipe({name: 'phoneFormat'})
export class PhoneFormatPipe implements PipeTransform {
  transform(value: string, exponent: string): string {
    // console.log(value.replace(/^(\d{3})(\d{4})(\d{4})$/,'$1****$3'))
    return value.replace(/^(\d{3})(\d{4})(\d{4})$/,'$1****$3');
  }
}