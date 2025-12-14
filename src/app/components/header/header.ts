import { Component, EventEmitter, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  @Output() onAboutClick = new EventEmitter<void>();

  openAbout(): void {
    this.onAboutClick.emit();
  }
}
