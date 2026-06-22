import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from '../../services/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container" *ngIf="toasts.length > 0">
      <div *ngFor="let t of toasts; let i = index" 
           class="toast-item"
           [ngClass]="{'toast-success': t.type === 'success', 'toast-error': t.type === 'error', 'toast-info': t.type === 'info'}">
        <div class="toast-icon">
          <i class="fa-solid" [ngClass]="{'fa-circle-check': t.type === 'success', 'fa-circle-exclamation': t.type === 'error', 'fa-circle-info': t.type === 'info'}"></i>
        </div>
        <div class="toast-message">{{ t.message }}</div>
        <button class="toast-close" (click)="remove(i)">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .toast-item {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 300px;
      max-width: 400px;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      animation: slideIn 0.3s ease-out forwards;
      background: #fff;
      border-left: 4px solid #CBD5E1;
    }
    .toast-success { border-left-color: #10B981; }
    .toast-error { border-left-color: #EF4444; }
    .toast-info { border-left-color: #3B82F6; }
    
    .toast-success .toast-icon { color: #10B981; }
    .toast-error .toast-icon { color: #EF4444; }
    .toast-info .toast-icon { color: #3B82F6; }

    .toast-icon { font-size: 1.25rem; display: flex; }
    .toast-message { flex: 1; font-size: 0.875rem; color: #1E293B; font-weight: 500; }
    .toast-close { background: none; border: none; color: #94A3B8; cursor: pointer; padding: 4px; display: flex; }
    .toast-close:hover { color: #475569; }

    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: ToastMessage[] = [];
  private sub!: Subscription;

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.sub = this.toastService.toast$.subscribe(toast => {
      this.toasts.push(toast);
      if (toast.duration && toast.duration > 0) {
        setTimeout(() => this.remove(0), toast.duration);
      }
    });
  }

  remove(index: number) {
    if (this.toasts.length > index) {
      this.toasts.splice(index, 1);
    }
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }
}
