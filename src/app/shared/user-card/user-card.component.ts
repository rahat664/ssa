import {CommonModule} from '@angular/common';
import {Component, EventEmitter, Input, Output} from '@angular/core';

type UserStatus = 'active' | 'inactive' | 'pending';

@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-card.component.html',
  styleUrl: './user-card.component.scss',
})
export class UserCardComponent {
  @Input() name = '';
  @Input() email = '';
  @Input() role = '';
  @Input() status: UserStatus = 'active';
  @Input() avatarUrl?: string;
  @Input() rolesCount = 0;
  @Input() rolesList: string[] = [];
  @Output() cardClick = new EventEmitter<void>();

  readonly defaultAvatar = 'assets/svg/user-inactive.svg';

  handleImgError(event: Event) {
    const target = event.target as HTMLImageElement;
    target.src = this.defaultAvatar;
  }

  onCardClick() {
    this.cardClick.emit();
  }

  statusClass(): string {
    switch (this.status) {
      case 'active':
        return 'badge--success';
      case 'pending':
        return 'badge--warning';
      default:
        return 'badge--muted';
    }
  }
}
