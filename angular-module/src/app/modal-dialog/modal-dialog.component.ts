import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { IDialogData } from '../../interfaces';

@Component({
  selector: 'app-modal-dialog',
  templateUrl: './modal-dialog.component.html',
  styleUrls: ['./modal-dialog.component.scss']
})
export class ModalDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: IDialogData) { }

  checkValidity(form: HTMLFormElement) {
    return form.checkValidity();
  }
}
