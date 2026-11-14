import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RelativeTimePipe } from '../../../shared/pipes/relative-time.pipe';
import { PostComment } from '../data-access/blog.models';

/** Comments with their replies. Text is always rendered as text (never HTML). */
@Component({
  selector: 'app-comment-list',
  imports: [RelativeTimePipe],
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

          @if (comment.replies.length) {
            <div class="mt-3 border-s-2 border-line ps-4">
              <app-comment-list [comments]="comment.replies" />
            </div>
          }
        </li>
      }
    </ul>
  `,
})
export class CommentListComponent {
  readonly comments = input.required<readonly PostComment[]>();

  protected initial(name: string): string {
    return Array.from(name.trim())[0] ?? '؟';
  }
}
