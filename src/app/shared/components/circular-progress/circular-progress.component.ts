import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-circular-progress',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="circular-progress" [style.width.px]="size" [style.height.px]="size">
      <svg [attr.width]="size" [attr.height]="size" [attr.viewBox]="'0 0 ' + size + ' ' + size">
        <!-- Background circle -->
        <circle
          [attr.cx]="size / 2"
          [attr.cy]="size / 2"
          [attr.r]="radius"
          [attr.stroke-width]="strokeWidth"
          class="progress-bg"
        />
        <!-- Progress circle -->
        <circle
          [attr.cx]="size / 2"
          [attr.cy]="size / 2"
          [attr.r]="radius"
          [attr.stroke-width]="strokeWidth"
          [attr.stroke-dasharray]="circumference"
          [attr.stroke-dashoffset]="dashOffset"
          [class]="'progress-fill ' + getColorClass()"
          class="progress-fill"
        />
      </svg>
      <div class="progress-content">
        <div class="progress-text">
          <div class="percentage">{{ percentage }}%</div>
          <div class="label" *ngIf="label">{{ label }}</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .circular-progress {
      position: relative;
      display: inline-block;
    }

    svg {
      transform: rotate(-90deg);
    }

    circle {
      fill: none;
    }

    .progress-bg {
      stroke: var(--ion-color-light);
      opacity: 0.3;
    }

    .progress-fill {
      transition: stroke-dashoffset 1s ease;
      stroke-linecap: round;
    }

    .progress-fill.low {
      stroke: var(--ion-color-success);
    }

    .progress-fill.medium {
      stroke: var(--ion-color-warning);
    }

    .progress-fill.high {
      stroke: var(--ion-color-danger);
    }

    .progress-content {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .progress-text {
      text-align: center;
    }

    .percentage {
      font-size: 2rem;
      font-weight: 700;
      line-height: 1;
      margin-bottom: 4px;
    }

    .label {
      font-size: 0.75rem;
      opacity: 0.7;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  `]
})
export class CircularProgressComponent {
  @Input() percentage: number = 0;
  @Input() size: number = 200;
  @Input() strokeWidth: number = 16;
  @Input() label?: string;

  get radius(): number {
    return (this.size - this.strokeWidth) / 2;
  }

  get circumference(): number {
    return 2 * Math.PI * this.radius;
  }

  get dashOffset(): number {
    return this.circumference - (this.percentage / 100) * this.circumference;
  }

  getColorClass(): string {
    if (this.percentage < 60) return 'low';
    if (this.percentage < 80) return 'medium';
    return 'high';
  }
}
