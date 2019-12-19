import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TemplatesComponent } from './templates.component';
import { EditTemplateComponent } from './edit-template/edit-template.component';

const routes: Routes = [{ path: '', component: TemplatesComponent }, { path: '/:id', component: EditTemplateComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TemplatesRoutingModule { }
