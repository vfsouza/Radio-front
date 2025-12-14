import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { DisclaimerModal } from './components/disclaimer-modal/disclaimer-modal';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, DisclaimerModal],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('radio');
  protected showDisclaimerModal = signal(true);

  openDisclaimerModal(): void {
    this.showDisclaimerModal.set(true);
  }

  closeDisclaimerModal(): void {
    this.showDisclaimerModal.set(false);
  }
}
