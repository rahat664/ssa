import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-chips',
  standalone: true,
  imports: [],
  templateUrl: './chips.component.html',
  styleUrl: './chips.component.scss'
})
export class ChipsComponent {
   @Input() chipText: string;

}
