import { Component } from '@angular/core';
import { HtmlEditorComponent } from './html-editor/html-editor.component';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [HtmlEditorComponent, ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  formGroup = new FormGroup({
    editor: new FormControl('test'),
  });
}
