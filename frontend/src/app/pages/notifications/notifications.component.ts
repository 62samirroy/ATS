import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <div class="page-header">
        <div>
          <h1 class="page-title">Notifications</h1>
          <p class="page-subtitle">Stay updated on all hiring activities</p>
        </div>
        <button *ngIf="notifications.length > 0" (click)="markAllRead()" id="btn-mark-all" class="btn-secondary">
          Mark all as read
        </button>
      </div>

      <div *ngIf="loading" class="space-y-3">
        <div *ngFor="let i of [1,2,3,4,5]" class="card skeleton h-16"></div>
      </div>

      <div *ngIf="!loading && notifications.length === 0" class="card text-center py-16">
        <svg class="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
        <p class="text-slate-400">You're all caught up! No notifications.</p>
      </div>

      <div *ngIf="!loading" class="space-y-2">
        <div *ngFor="let n of notifications" (click)="markRead(n)"
             class="card flex items-start gap-4 cursor-pointer transition-all hover:border-primary-500/20"
             [class.opacity-60]="n.isRead">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
               [class]="getTypeStyle(n.type).bg">
            <span class="text-base">{{ getTypeStyle(n.type).icon }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2">
              <div>
                <p class="text-sm font-semibold text-white" [class.text-slate-400]="n.isRead">{{ n.title }}</p>
                <p class="text-sm text-slate-400 mt-0.5">{{ n.message }}</p>
              </div>
              <div class="flex items-center gap-2 flex-shrink-0">
                <span *ngIf="!n.isRead" class="w-2 h-2 bg-primary-500 rounded-full"></span>
                <span class="text-xs text-slate-500">{{ n.createdAt | date:'shortTime' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class NotificationsComponent implements OnInit {
  notifications: any[] = [];
  loading = true;

  constructor(private notifService: NotificationService) {}

  ngOnInit() {
    this.notifService.getNotifications().subscribe({
      next: n => { this.notifications = n; this.loading = false; },
      error: () => {
        this.notifications = [
          { _id: '1', title: 'New Application', message: 'Alex Johnson applied for Senior Frontend Developer', type: 'Application', isRead: false, createdAt: new Date() },
          { _id: '2', title: 'Interview Scheduled', message: 'Interview with Maria Garcia scheduled for tomorrow at 2 PM', type: 'Interview', isRead: false, createdAt: new Date(Date.now() - 3600000) },
          { _id: '3', title: 'Feedback Submitted', message: 'David Kim submitted feedback for James Wilson', type: 'Feedback', isRead: true, createdAt: new Date(Date.now() - 7200000) },
          { _id: '4', title: 'Offer Released', message: 'Offer letter sent to Sophie Chen for Product Designer role', type: 'Offer', isRead: true, createdAt: new Date(Date.now() - 86400000) },
        ];
        this.loading = false;
      }
    });
  }

  markRead(n: any) {
    if (n.isRead) return;
    this.notifService.markAsRead(n._id).subscribe({ next: () => n.isRead = true, error: () => n.isRead = true });
  }

  markAllRead() {
    this.notifService.markAllAsRead().subscribe({
      next: () => this.notifications.forEach(n => n.isRead = true),
      error: () => this.notifications.forEach(n => n.isRead = true)
    });
  }

  getTypeStyle(type: string): { bg: string; icon: string } {
    const map: any = {
      Application: { bg: 'bg-blue-500/10', icon: '📄' },
      Interview: { bg: 'bg-primary-500/10', icon: '📅' },
      Offer: { bg: 'bg-emerald-500/10', icon: '🎉' },
      Feedback: { bg: 'bg-amber-500/10', icon: '💬' },
      System: { bg: 'bg-slate-500/10', icon: '🔔' },
    };
    return map[type] || map.System;
  }
}
