import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-storage-card',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
  template: `
    <ion-card [routerLink]="routerLink" button="true" class="storage-card">
      <div class="card-content">
        <div class="icon-wrapper" [style.background]="gradientColor">
          <ion-icon [name]="icon"></ion-icon>
        </div>
        <div class="info">
          <div class="category-name">{{ categoryName }}</div>
          <div class="file-count" *ngIf="fileCount">{{ fileCount }} files</div>
        </div>
        <div class="stats">
          <div class="size">{{ size }}</div>
          <div class="percentage" *ngIf="percentage !== undefined">{{ percentage }}%</div>
        </div>
        <ion-icon name="chevron-forward-outline" class="chevron"></ion-icon>
      </div>
      <div class="progress-bar" *ngIf="percentage !== undefined">
        <div class="progress-fill" [style.width.%]="percentage" [style.background]="progressColor"></div>
      </div>
    </ion-card>
  `,
  styles: [`
    .storage-card {
      margin: 12px 16px;
      border-radius: 16px;
      overflow: hidden;
      --background: var(--ion-card-background, #fff);
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      position: relative;
    }

    .storage-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.02);
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
    }

    .storage-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    }

    .storage-card:hover::before {
      opacity: 1;
    }

    .storage-card:active {
      transform: translateY(-2px) scale(0.98);
      box-shadow: 0 4px 16px rgba(0,0,0,0.12);
      transition-duration: 0.1s;
    }

    .card-content {
      display: flex;
      align-items: center;
      padding: 16px;
      gap: 12px;
    }

    .icon-wrapper {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .storage-card:hover .icon-wrapper {
      transform: scale(1.1) rotate(5deg);
    }

    .icon-wrapper ion-icon {
      font-size: 24px;
      color: white;
    }

    .info {
      flex: 1;
      min-width: 0;
    }

    .category-name {
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 2px;
      transition: color 0.2s ease;
    }

    .storage-card:hover .category-name {
      color: var(--ion-color-primary);
    }

    .file-count {
      font-size: 0.875rem;
      opacity: 0.6;
    }

    .stats {
      text-align: right;
      margin-right: 8px;
    }

    .size {
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 2px;
    }

    .percentage {
      font-size: 0.875rem;
      opacity: 0.6;
    }

    .chevron {
      font-size: 20px;
      opacity: 0.4;
      flex-shrink: 0;
    }

    .progress-bar {
      height: 3px;
      background: rgba(0,0,0,0.05);
      position: relative;
    }

    .progress-fill {
      height: 100%;
      transition: width 0.6s ease;
    }
  `]
})
export class StorageCardComponent {
  @Input() icon: string = 'folder-outline';
  @Input() categoryName: string = '';
  @Input() fileCount?: number;
  @Input() size: string = '';
  @Input() percentage?: number;
  @Input() routerLink?: string;
  @Input() gradientColor: string = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  @Input() progressColor: string = '#667eea';
}
