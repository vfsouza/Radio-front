import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface HistoryItem {
  id: string;
  patientId: string;
  patientName: string;
  bodyRegion: string;
  fractureType?: string;
  fractureLocation?: string;
  imageUrl?: string;
  timestamp: Date;
  status: 'success' | 'failed';
  confidence?: number;
  severity?: 'low' | 'medium' | 'high';
  detections?: any[];
  fileName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DetectionHistoryService {
  private historyItems = new BehaviorSubject<HistoryItem[]>([]);
  public historyItems$ = this.historyItems.asObservable();

  constructor() {
    // Carregar dados do localStorage se existirem
    const savedHistory = localStorage.getItem('detection_history');
    if (savedHistory) {
      const items = JSON.parse(savedHistory);
      // Converter strings de data de volta para objetos Date
      items.forEach((item: HistoryItem) => {
        item.timestamp = new Date(item.timestamp);
      });
      this.historyItems.next(items);
    }
  }

  addDetection(detection: HistoryItem): void {
    const currentItems = this.historyItems.value;
    const newItems = [detection, ...currentItems];
    this.historyItems.next(newItems);

    // Salvar no localStorage
    localStorage.setItem('detection_history', JSON.stringify(newItems));
  }

  getAll(): HistoryItem[] {
    return this.historyItems.value;
  }

  deleteItem(id: string): void {
    const currentItems = this.historyItems.value;
    const newItems = currentItems.filter(item => item.id !== id);
    this.historyItems.next(newItems);

    // Atualizar localStorage
    localStorage.setItem('detection_history', JSON.stringify(newItems));
  }

  clearAll(): void {
    this.historyItems.next([]);
    localStorage.removeItem('detection_history');
  }
}
