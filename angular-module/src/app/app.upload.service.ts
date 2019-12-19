import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { IIPImageUploader, IpEmailBuilderService } from 'ip-email-builder';
import { fromEvent, Subscription } from 'rxjs';
// import { ajax } from 'rxjs/ajax';

const input = document.createElement('input');
input.type = 'file';

// fromEvent(input, 'change').subscribe(() => {
//   console.log('Change');
// });

@Injectable()
export class UploadImageService implements IIPImageUploader {
  inputObserver: Subscription;

  constructor(private http: HttpClient, private ngb: IpEmailBuilderService) { }

  async browse(): Promise<string> {
    return new Promise((res, rej) => {
      this.inputObserver = fromEvent(input, 'change').subscribe(async () => {
        this.inputObserver.unsubscribe();
        if (!input.files.length) {
          return rej('No files was chosen');
        }
        try {
          this.ngb.isLoading.next(true);
          const path = await this.imageHandle();
          return res(path);
        } catch (error) {
          this.ngb.isLoading.next(false);
          this.ngb.notify(error, null, 3000);
          return rej(error);
        }
      });
      input.click();
    });
  }

  async imageHandle(): Promise<string> {
    const formData = new FormData();
    formData.append('image', input.files[0]);
    formData.append(environment.globalVariable.CSRF.name, environment.globalVariable.CSRF.token);

    const res: any = await this.http.post(`${environment.globalVariable.API_BASE}/upload`, formData).toPromise();

    if (res.success) {
      return res.path;
    }
    return Promise.reject('Something went wrong');
  }
}
