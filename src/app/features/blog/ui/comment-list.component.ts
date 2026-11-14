import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RelativeTimePipe } from '../../../shared/pipes/relative-time.pipe';
import { PostComment } from '../data-access/blog.models';
import { IconComponent } from '../../../shared/ui/icon/icon.component';

/** Comments with their replies. Text is always rendered as text (never HTML). */
@Component({
  selector: 'app-comment-list',
  imports: [RelativeTimePipe, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul class="grid gap-4">
      @for (comment of comments(); track comment.id) {
        <li class="rounded-[1.25rem] border border-line bg-card p-4">
          <div class="mb-1.5 flex items-center gap-2 text-[0.8125rem] text-mut">
            <span
              class="grid size-7 place-items-center rounded-full bg-bg-2 text-[0.75rem] font-bold text-fg"
              aria-hidden="true"
              >{{ initial(comment.authorName) }}</span
            >
            <b class="font-bold text-fg">{{ comment.authorName }}</b>
            <time [attr.datetime]="comment.createdAt">{{ comment.createdAt | relativeTime }}</time>
          </div>
          <p class="text-[0.9375rem] leading-[1.9] whitespace-pre-line">{{ comment.body }}</p>

          @if (allowReply() || comment.canDelete) {
            <div class="mt-2 flex gap-4 text-[0.8125rem] text-mut">
              @if (allowReply()) {
                <button type="button" class="inline-flex cursor-pointer items-center gap-1.5 hover:text-fg" (click)="reply.emit(comment)"><app-icon name="reply" />پاسخ</button>
              }
              @if (comment.canDelete) {
                <button type="button" class="inline-flex cursor-pointer items-center gap-1.5 hover:text-rose" aria-label="حذف نظر" (click)="remove.emit(comment)"><app-icon name="trash" />حذف</button>
              }
            </div>
          }

          @if (comment.replies.length) {
            <div class="mt-3 border-s-2 border-line ps-4">
              <app-comment-list
                [comments]="comment.replies"
                [allowReply]="false"
                (remove)="remove.emit($event)"
              />
            </div>
          }
        </li>
      }
    </ul>
  `,
})
export class CommentListComponent {
  readonly comments = input.required<readonly PostComment[]>();
  /** Replies are one level deep, so replies themselves cannot be answered. */
  readonly allowReply = input(true);

  readonly reply = output<PostComment>();
  readonly remove = output<PostComment>();

  protected initial(name: string): string {
    return Array.from(name.trim())[0] ?? '؟';
  }
}
