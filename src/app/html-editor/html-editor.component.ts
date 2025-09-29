import {
  Component,
  createComponent,
  EnvironmentInjector,
  forwardRef,
  Input,
  OnInit,
  signal,
  ViewChild,
  ViewContainerRef,
  inject,
  ComponentRef,
} from '@angular/core';
import {
  ControlContainer,
  ControlValueAccessor,
  FormControl,
  FormGroup,
  FormsModule,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  ValidationErrors,
  Validator,
} from '@angular/forms';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Platform } from '@angular/cdk/platform';
import { FroalaComponent } from './froala/froala.component';

@Component({
  selector: 'lib-html-editor',
  imports: [FormsModule, ReactiveFormsModule],
  // changeDetection: ChangeDetectionStrategy.Default,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => HtmlEditorComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      multi: true,
      useExisting: HtmlEditorComponent,
    },
  ],
  templateUrl: './html-editor.component.html',
  styleUrls: ['./html-editor.component.css'],
})
export class HtmlEditorComponent implements ControlValueAccessor, OnInit, Validator {
  controlContainer = inject(ControlContainer);
  private platform = inject(Platform);
  private envInjector = inject(EnvironmentInjector);

  parentFormControl = signal<FormControl | null>(null);

  @Input({ required: true }) formControlName!: string;
  @Input() editorHeight = 600;
  @Input() scrollableContainerId: string | undefined;

  formControl = new FormControl<string | null>(null);

  writeValue = (inp: string | null): void => {
    this.formControl.setValue(inp);
  };
  registerOnChange = (fn: () => void): void => {
    this.onModelChange = fn;
  };
  registerOnTouched = (fn: () => void): void => {
    this.onModelTouched = fn;
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private onModelChange = (_: string | null) => {};
  private onModelTouched!: () => void;
  controlId = signal('');

  constructor() {
    this.formControl.valueChanges.pipe(takeUntilDestroyed()).subscribe((val) => {
      this.onModelChange(val);
    });
    this.controlId.set(
      Math.random()
        .toString(36)
        .replace(/[^a-z]+/g, ''),
    );
  }

  @ViewChild('froalaViewContainerRef', { read: ViewContainerRef })
  private froalaViewContainerRef: ViewContainerRef | null = null;

  onBlur() {
    this.onModelTouched();
  }

  froalaComponent: ComponentRef<FroalaComponent> | null = null;

  loadFroala = async () => {
    const { FroalaComponent } = await import('./froala/froala.component');

    this.froalaComponent = createComponent(FroalaComponent, {
      environmentInjector: this.envInjector,
    });

    if (this.froalaViewContainerRef) {
      this.froalaViewContainerRef.insert(this.froalaComponent.hostView);
    }

    this.froalaComponent.instance.formControl = this.formControl;
    this.froalaComponent.instance.controlId = this.controlId();
    if (this.scrollableContainerId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.froalaComponent.instance.options as any).scrollableContainer =
        '#' + this.scrollableContainerId;
    }
  };

  validate(): ValidationErrors | null {
    if (this.formControl.valid) {
      return null;
    } else {
      return {
        mustBeValid: {
          formControl: this.formControl,
        },
      };
    }
  }

  async ngOnInit() {
    this.parentFormControl.set(
      (this.controlContainer.control as FormGroup).get(this.formControlName) as FormControl,
    );
    if (this.platform.isBrowser) {
      await this.loadFroala();
    }
  }
}
