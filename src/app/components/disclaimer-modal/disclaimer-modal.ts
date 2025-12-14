import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-disclaimer-modal',
  standalone: true,
  imports: [],
  templateUrl: './disclaimer-modal.html',
  styleUrl: './disclaimer-modal.css'
})
export class DisclaimerModal {
  @Input() showModal = true;
  @Output() onClose = new EventEmitter<void>();

  accept(): void {
    this.showModal = false;
    this.onClose.emit();
  }

  close(): void {
    this.accept();
  }
}
