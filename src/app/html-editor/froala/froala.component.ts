import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { FroalaEditorModule } from 'angular-froala-wysiwyg';
import 'froala-editor/js/plugins/align.min.js';
import 'froala-editor/js/plugins/char_counter.min.js';
import 'froala-editor/js/plugins/colors.min.js';
import 'froala-editor/js/plugins/draggable.min.js';
import 'froala-editor/js/plugins/emoticons.min.js';
import 'froala-editor/js/plugins/font_family.min.js';
import 'froala-editor/js/plugins/font_size.min.js';
import 'froala-editor/js/plugins/help.min.js';
import 'froala-editor/js/plugins/image.min.js';
import 'froala-editor/js/plugins/line_breaker.min.js';
import 'froala-editor/js/plugins/line_height.min.js';
import 'froala-editor/js/plugins/link.min.js';
import 'froala-editor/js/plugins/lists.min.js';
import 'froala-editor/js/plugins/paragraph_format.min.js';
import 'froala-editor/js/plugins/paragraph_style.min.js';
import 'froala-editor/js/plugins/print.min.js';
import 'froala-editor/js/plugins/quick_insert.min.js';
import 'froala-editor/js/plugins/table.min.js';
// import 'froala-editor/js/plugins/find_and_replace.min.js';
import 'froala-editor/js/plugins/word_paste.min.js';
import 'froala-editor/js/third_party/font_awesome.min.js';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FroalaEditorDirective } from 'angular-froala-wysiwyg';
import FroalaEditor from 'froala-editor';

const GcFroalaLicense = 'add license here';

class Picture extends File {
  compressedSize!: number;
}

interface FroalaInitializer {
  initialize(): void;

  getEditor(): unknown;
}

@Component({
  selector: 'lib-froala',
  imports: [FroalaEditorModule, ReactiveFormsModule],
  templateUrl: './froala.component.html',
  styleUrl: './froala.component.css',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class FroalaComponent implements OnInit {
  public mergeTagsAllowed = false;

  @ViewChild('froalaInstance', { static: false }) froalaEditorDirective!: FroalaEditorDirective;
  public options = {
    fontSize: [
      '8',
      '9',
      '10',
      '11',
      '12',
      '14',
      '16',
      '18',
      '24',
      '30',
      '36',
      '48',
      '60',
      '72',
      '96',
    ],
    lineHeights: {
      Default: '',
      Single: '1',
      '1.15': '1.15',
      '1.3': '1.3',
      '1.5': '1.5',
      Double: '2',
    },
    events: {
      'image.beforeUpload': (files: Picture[]) => {
        return this.validateImageBeforeSend(files);
      },
      'image.uploaded': () => {},
    },
    // sticky toolbar behaves weirdly in a dialog
    // toolbarSticky: true,
    key: GcFroalaLicense,
    placeholderText: 'Edit Your Content Here!',
    charCounterCount: true,
    listAdvancedTypes: true,
    heightMin: 300,
    tableResizerOffset: 10,
    tableResizingLimit: 50,
    imageUploadParams: { id: 'my_editor' },
    imageUploadMethod: 'POST',
    imageMaxSize: 5 * 1024 * 1024,
    imageDefaultWidth: 150,
    imageAllowedTypes: ['jpeg', 'jpg', 'png'],
    imageStyles: {
      'fr-rounded': 'Rounded',
      'fr-bordered': 'Bordered',
      'fr-wrap-left': 'Image Wrap Left',
      'fr-wrap-right': 'Image Wrap Right',
    },
    requestHeaders: {},
    zIndex: 1000,
    toolbarButtons: [
      'lineHeight',
      'bold',
      'italic',
      'underline',
      'fontFamily',
      'fontSize',
      'textColor',
      'backgroundColor',
      'paragraphStyle',
      'paragraphFormat',
      'alignLeft',
      'alignCenter',
      'alignRight',
      'alignJustify',
      'formatOL',
      'formatUL',
      'outdent',
      'indent',
      'quote',
      'insertLink',
      'insertImage',
      'insertTable',
      'emoticons',
      'fontAwesome',
      'insertHR',
      'print',
      'help',
      'undo',
      'redo',
      'findReplaceButton',
    ],

    tableStyles: {
      'fr-alternate-rows': 'Alternate Rows',
      'fr-dashed-borders': 'Dashed Borders',
      'fr-solid-border': 'Solid Border',
    },

    colorsBackground: [
      '#15E67F',
      '#E3DE8C',
      '#D8A076',
      '#D83762',
      '#76B6D8',
      'REMOVE',
      '#1C7A90',
      '#249CB8',
      '#4ABED9',
      '#FBD75B',
      '#FBE571',
      '#FFFFFF',
    ],
    colorsStep: 6,
    colorsText: [
      '#FFFFFF',
      '#000000',
      '#61BD6D',
      '#54ACD2',
      '#e17411',
      '#c0c0c0',
      '#ffd150',
      '#7e9ca2',
      '#3b5998',
      '#800080',
      '#eb8c00',
      '#a32020',
      'REMOVE',
    ],
  };
  editorInstance: FroalaEditor | null = null;
  public formControl = new FormControl<string | null>(null);
  public controlId = '';

  validateImageBeforeSend(files: Picture[]): boolean {
    const file = files[0];
    if (file.size === file.compressedSize) {
      //Here we checked, to avoid repetitive trigger since we manually trigger image upload again (.image.upload(files))
      return true;
    }

    return false; //Returning false will cancel the event processing, allowing us to intercept, process the image, and upload it manually.
  }

  public initialize(initControls: object) {
    (initControls as FroalaInitializer).initialize();

    const intervalId = setInterval(() => {
      this.editorInstance = (initControls as FroalaInitializer).getEditor() as FroalaEditor;
      if (this.editorInstance) {
        clearInterval(intervalId);
      }
    }, 10);
  }

  ngOnInit(): void {
    if (this.mergeTagsAllowed) {
      this.options.toolbarButtons.push('Merge Tag');

      FroalaEditor.DefineIcon('mergeTagIcon', {
        template: 'font_awesome_5',
        FA5NAME: 'code-merge',
        title: 'Insert Merge Tag',
      });

      FroalaEditor.RegisterCommand('Merge Tag', {
        title: 'Merge Tag',
        icon: 'mergeTagIcon',
        type: 'dropdown',
        options: {
          '{{first_name}}': 'First Name',
          '{{last_name}}': 'Last Name',
          '{{organisation}}': 'Organisation',
          '{{member_number}}': 'Member Number',
          '{{preferred_name}}': 'Preferred Name',
          '{{membership_type}}': 'Membership Type',
        },
        callback: (_: string, val: string) => {
          // @ts-expect-error editorInstance is unknown
          this.editorInstance.html.insert('<span  >' + val + '</span>');
        },
      });
    }
  }
}

// import {
//   ChangeDetectionStrategy,
//   Component,
//   Inject,
//   OnInit,
//   PLATFORM_ID,
//   ViewChild,
// } from '@angular/core';
// import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';
// import { FormControl, ReactiveFormsModule } from '@angular/forms';
// import { FroalaEditorDirective } from 'angular-froala-wysiwyg';
// import FroalaEditor from 'froala-editor';
// import { isPlatformBrowser, JsonPipe } from '@angular/common';
//
// const GcFroalaLicense =
//   'eHE5C-11A2B2I2G2B4C3C1td1CGHNOa1TNSPH1e1J1VLPUUCVd1FC-22C4A3C3F3D4G2H2C3A2C2==';
//
// interface FroalaInitializer {
//   initialize(): void;
//
//   getEditor(): unknown;
// }
//
// @Component({
//   selector: 'lib-froala',
//   imports: [FroalaEditorModule, FroalaViewModule, ReactiveFormsModule, JsonPipe],
//   templateUrl: './froala.component.html',
//   styleUrl: './froala.component.css',
//   changeDetection: ChangeDetectionStrategy.Default,
// })
// export class FroalaComponent implements OnInit {
//   @ViewChild('froalaInstance', { static: false }) froalaEditorDirective!: FroalaEditorDirective;
//   public options = {
//     fontSize: [
//       '8',
//       '9',
//       '10',
//       '11',
//       '12',
//       '14',
//       '16',
//       '18',
//       '24',
//       '30',
//       '36',
//       '48',
//       '60',
//       '72',
//       '96',
//     ],
//     lineHeights: {
//       Default: '',
//       Single: '1',
//       '1.15': '1.15',
//       '1.3': '1.3',
//       '1.5': '1.5',
//       Double: '2',
//     },
//     // sticky toolbar behaves weirdly in a dialog
//     // toolbarSticky: true,
//     key: GcFroalaLicense,
//     placeholderText: 'Edit Your Content Here!',
//     charCounterCount: true,
//     listAdvancedTypes: true,
//     heightMin: 300,
//     tableResizerOffset: 10,
//     tableResizingLimit: 50,
//     imageDefaultWidth: 150,
//     imageAllowedTypes: ['jpeg', 'jpg', 'png'],
//     imageStyles: {
//       'fr-rounded': 'Rounded',
//       'fr-bordered': 'Bordered',
//       'fr-wrap-left': 'Image Wrap Left',
//       'fr-wrap-right': 'Image Wrap Right',
//     },
//     requestHeaders: {},
//     zIndex: 1000,
//     toolbarButtons: [
//       'lineHeight',
//       'bold',
//       'italic',
//       'underline',
//       'fontFamily',
//       'fontSize',
//       'textColor',
//       'backgroundColor',
//       'paragraphStyle',
//       'paragraphFormat',
//       'alignLeft',
//       'alignCenter',
//       'alignRight',
//       'alignJustify',
//       'formatOL',
//       'formatUL',
//       'outdent',
//       'indent',
//       'quote',
//       'insertLink',
//       'insertImage',
//       'insertTable',
//       'emoticons',
//       'fontAwesome',
//       'insertHR',
//       'print',
//       'help',
//       'undo',
//       'redo',
//       'findReplaceButton',
//     ],
//
//     tableStyles: {
//       'fr-alternate-rows': 'Alternate Rows',
//       'fr-dashed-borders': 'Dashed Borders',
//       'fr-solid-border': 'Solid Border',
//     },
//
//     colorsBackground: [
//       '#15E67F',
//       '#E3DE8C',
//       '#D8A076',
//       '#D83762',
//       '#76B6D8',
//       'REMOVE',
//       '#1C7A90',
//       '#249CB8',
//       '#4ABED9',
//       '#FBD75B',
//       '#FBE571',
//       '#FFFFFF',
//     ],
//     colorsStep: 6,
//     colorsText: [
//       '#FFFFFF',
//       '#000000',
//       '#61BD6D',
//       '#54ACD2',
//       '#e17411',
//       '#c0c0c0',
//       '#ffd150',
//       '#7e9ca2',
//       '#3b5998',
//       '#800080',
//       '#eb8c00',
//       '#a32020',
//       'REMOVE',
//     ],
//   };
//   editorInstance: FroalaEditor | null = null;
//   public formControl = new FormControl<string | null>(null);
//   public controlId = '';
//
//   public initialize(initControls: object) {
//     (initControls as FroalaInitializer).initialize();
//
//     const intervalId = setInterval(() => {
//       this.editorInstance = (initControls as FroalaInitializer).getEditor() as FroalaEditor;
//       if (this.editorInstance) {
//         clearInterval(intervalId);
//       }
//     }, 10);
//   }
//
//   constructor(@Inject(PLATFORM_ID) private platformId: Object) {}
//
//   ngOnInit() {
//     if (isPlatformBrowser(this.platformId)) {
//       // @ts-ignore
//       import('froala-editor/js/plugins/align.min.js');
//       // @ts-ignore
//       import('froala-editor/js/plugins/char_counter.min.js');
//       // @ts-ignore
//       import('froala-editor/js/plugins/colors.min.js');
//       // @ts-ignore
//       import('froala-editor/js/plugins/draggable.min.js');
//       // @ts-ignore
//       import('froala-editor/js/plugins/emoticons.min.js');
//       // @ts-ignore
//       import('froala-editor/js/plugins/font_family.min.js');
//       // @ts-ignore
//       import('froala-editor/js/plugins/font_size.min.js');
//       // @ts-ignore
//       import('froala-editor/js/plugins/help.min.js');
//       // @ts-ignore
//       import('froala-editor/js/plugins/image.min.js');
//       // @ts-ignore
//       import('froala-editor/js/plugins/line_breaker.min.js');
//       // @ts-ignore
//       import('froala-editor/js/plugins/line_height.min.js');
//       // @ts-ignore
//       import('froala-editor/js/plugins/link.min.js');
//       // @ts-ignore
//       import('froala-editor/js/plugins/lists.min.js');
//       // @ts-ignore
//       import('froala-editor/js/plugins/paragraph_format.min.js');
//       // @ts-ignore
//       import('froala-editor/js/plugins/paragraph_style.min.js');
//       // @ts-ignore
//       import('froala-editor/js/plugins/print.min.js');
//       // @ts-ignore
//       import('froala-editor/js/plugins/quick_insert.min.js');
//       // @ts-ignore
//       import('froala-editor/js/plugins/table.min.js');
//       // @ts-ignore
//       import('froala-editor/js/plugins/find_and_replace.min.js');
//       // @ts-ignore
//       import('froala-editor/js/plugins/word_paste.min.js');
//       // @ts-ignore
//       import('froala-editor/js/third_party/font_awesome.min.js');
//     }
//   }
// }
