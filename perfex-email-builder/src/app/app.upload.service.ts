
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { IIPImageUploader } from 'ip-email-builder';
import { Subject, fromEvent, Observer, Observable, Subscription } from 'rxjs';

const input = document.createElement('input');
input.type = 'file';

// fromEvent(input, 'change').subscribe(() => {
//   console.log('Change');
// });

@Injectable()
export class UploadImageService implements IIPImageUploader {
  inputObserver: Subscription;

  constructor(private http: HttpClient) {
  }

  async browse(): Promise<string> {
    return new Promise(res => {
      this.inputObserver = fromEvent(input, 'change').subscribe(async () => {
        this.inputObserver.unsubscribe();
        const path = await this.imageHandle();
        return res(path);
      });
      input.click();
    });
  }

  async imageHandle(): Promise<string> {
    const formData = new FormData();
    formData.append('image', input.files[0]);
    // formData.append(environment)
    return '';
  }
}
