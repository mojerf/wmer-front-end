import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { combineLatest, filter, of, switchMap } from 'rxjs';
import { errorMessage, fieldError } from '../../core/http/api-errors';
import { FieldComponent } from '../../shared/ui/field/field.component';
import { AdminApi } from './data-access/admin.api';
import { CONTENT_SCHEMAS, ContentField, isContentType } from './data-access/admin.models';

/** One form for works, posts and products; the fields come from the type's schema. */
@Component({
  selector: 'app-admin-content-form-page',
  imports: [ReactiveFormsModule, RouterLink, FieldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (schema(); as schema) {
      <h1 class="text-[clamp(1.5rem,3.5vw,2rem)] font-black tracking-[-0.02em]">
        {{ editing() ? 'ویرایش' : 'افزودن' }} {{ schema.singular }}
      </h1>

      @if (loading()) {
        <p role="status" class="mt-6 text-mut">در حال بارگذاری…</p>
      } @else {
        <form class="mt-6 grid max-w-[44rem] gap-4 rounded-[1.75rem] border border-line bg-card p-6" [formGroup]="form" (ngSubmit)="submit()" novalidate>
          @for (field of schema.fields; track field.name) {
            <app-field [label]="field.label + (field.required ? ' *' : '')" [error]="errorFor(field)">
              @switch (field.kind) {
                @case ('textarea') {
                  <textarea class="input-field" rows="6" [formControlName]="field.name"></textarea>
                }
                @case ('image') {
                  <input class="input-field" type="file" accept="image/png,image/jpeg,image/webp" (change)="pick(field.name, $event)" />
                  @if (currentImages()[field.name]; as url) {
                    <img [src]="url" alt="" width="96" height="64" class="mt-1 h-[4rem] w-[6rem] rounded-[0.5rem] object-cover" />
                  }
                }
                @default {
                  <input
                    class="input-field"
                    [type]="field.kind === 'number' ? 'number' : field.kind === 'url' ? 'url' : 'text'"
                    [attr.dir]="field.ltr ? 'ltr' : null"
                    [formControlName]="field.name"
                  />
                }
              }
            </app-field>
          }

          @if (formError()) {
            <p role="alert" class="rounded-[0.875rem] bg-rose/10 px-4 py-3 text-[0.875rem] text-rose">{{ formError() }}</p>
          }

          <div class="flex gap-3">
            <button type="submit" class="btn btn-main cursor-pointer" [disabled]="submitting()">
              {{ submitting() ? 'در حال ذخیره…' : 'ذخیره' }}
            </button>
            <a [routerLink]="['/admin/content', schema.type]" class="btn">انصراف</a>
          </div>
        </form>
      }
    }
  `,
})
export class AdminContentFormPageComponent {
  /** Route parameters, through component input binding. No `id` means "create". */
  readonly type = input<string>();
  readonly id = input<string>();

  private readonly api = inject(AdminApi);
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly schema = computed(() => {
    const type = this.type();
    return isContentType(type) ? CONTENT_SCHEMAS[type] : null;
  });

  protected readonly editing = computed(() => this.id() !== undefined);
  protected readonly loading = signal(false);
  protected readonly submitting = signal(false);
  protected readonly formError = signal<string | null>(null);
  protected readonly serverErrors = signal<unknown>(null);
  protected readonly currentImages = signal<Record<string, string | null>>({});

  protected form = this.fb.group({});
  private readonly files = new Map<string, File>();

  constructor() {
    combineLatest([toObservable(this.schema), toObservable(this.id)])
      .pipe(
        filter(([schema]) => schema !== null),
        switchMap(([schema, id]) => {
          this.buildForm(schema!.fields);
          if (id === undefined) {
            return of(null);
          }
          this.loading.set(true);
          return this.api.get(schema!.type, Number(id));
        }),
      )
      .subscribe({
        next: (data) => {
          if (data) {
            this.fill(data);
          }
          this.loading.set(false);
        },
        error: (error: unknown) => {
          this.loading.set(false);
          this.formError.set(errorMessage(error));
        },
      });
  }

  protected errorFor(field: ContentField): string | null {
    return fieldError(this.serverErrors(), field.name) ?? this.localError(field);
  }

  protected pick(name: string, event: Event): void {
    const file = (event.target as HTMLInputElement).files?.item(0);
    if (file) {
      this.files.set(name, file);
    } else {
      this.files.delete(name);
    }
  }

  protected submit(): void {
    const schema = this.schema();
    if (!schema) {
      return;
    }
    this.form.markAllAsTouched();
    this.serverErrors.set(null);
    this.formError.set(null);

    const missingImage = schema.fields.some((f) => f.kind === 'image' && f.required && !this.editing() && !this.files.has(f.name));
    if (this.form.invalid || missingImage) {
      this.formError.set('فیلدهای ستاره‌دار را کامل کنید.');
      return;
    }

    const body = new FormData();
    for (const field of schema.fields) {
      if (field.kind === 'image') {
        const file = this.files.get(field.name);
        if (file) {
          body.append(field.name, file);
        }
      } else {
        body.append(field.name, String(this.form.get(field.name)?.value ?? ''));
      }
    }

    this.submitting.set(true);
    const id = this.id();
    this.api.save(schema.type, id === undefined ? null : Number(id), body).subscribe({
      next: () => void this.router.navigate(['/admin/content', schema.type]),
      error: (error: unknown) => {
        this.submitting.set(false);
        this.serverErrors.set(error);
        this.formError.set(errorMessage(error));
      },
    });
  }

  private buildForm(fields: readonly ContentField[]): void {
    const controls: Record<string, [string, ...unknown[]]> = {};
    for (const field of fields) {
      if (field.kind !== 'image') {
        controls[field.name] = ['', field.required ? Validators.required : []];
      }
    }
    this.form = this.fb.group(controls);
    this.files.clear();
    this.currentImages.set({});
    this.serverErrors.set(null);
    this.formError.set(null);
    this.submitting.set(false);
  }

  private fill(data: Record<string, unknown>): void {
    const values: Record<string, string> = {};
    const images: Record<string, string | null> = {};
    for (const field of this.schema()?.fields ?? []) {
      const value = data[field.name];
      if (field.kind === 'image') {
        images[field.name] = typeof value === 'string' ? value : null;
      } else {
        values[field.name] = value === null || value === undefined ? '' : String(value);
      }
    }
    this.form.patchValue(values);
    this.currentImages.set(images);
  }

  private localError(field: ContentField): string | null {
    const control = this.form.get(field.name);
    return control && control.touched && control.hasError('required') ? 'این فیلد الزامی است.' : null;
  }
}
