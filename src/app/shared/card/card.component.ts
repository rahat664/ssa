import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output, SimpleChanges} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ModuleSummary} from '../../pages/sass/models/modules.model';
import {SharedService} from '../service/shared.service';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardComponent {
  @Input() moduleSummary: ModuleSummary
  @Input() roleName?: string;
  @Output() customize: EventEmitter<any> = new EventEmitter();
  @Output() toggle: EventEmitter<any> = new EventEmitter();
  isToggled: boolean = false;

  constructor(private shared: SharedService) {
  }

  onclickCustomize() {
    this.customize.emit(this.moduleSummary);
  }

  ngOnChanges(changes: SimpleChanges) {
    changes['moduleSummary']?.currentValue && (this.isToggled = changes['moduleSummary'].currentValue.active);
  }

  onClickToggle() {
    if (this.moduleSummary?.totalFeature > 0) {
      this.isToggled = !this.isToggled;
      this.toggle.emit({module: this.moduleSummary, isActive: this.isToggled});
    } else {
      this.isToggled = false;
      this.shared.showInfo('Please add feature(s) to activate the module.');
    }
  }
}
