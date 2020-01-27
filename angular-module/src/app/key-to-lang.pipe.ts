import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'keyToLang'
})
export class KeyToLangPipe implements PipeTransform {

  transform(value: string, ...args: any[]): string {
    return value.split('_').join(' ');
  }

}
