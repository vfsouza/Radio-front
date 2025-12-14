import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface DetectionFormData {
  patientName: string;
  patientId: string;
  bodyRegion: string;
  fractureType: string;
  fractureLocation: string;
  severity: 'low' | 'medium' | 'high';
  saveToHistory: boolean;
}

@Component({
  selector: 'app-detection-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './detection-modal.html',
  styleUrl: './detection-modal.css'
})
export class DetectionModal {
  @Input() detections: any[] = [];
  @Input() fileName: string = '';
  @Input() imageUrl: string = '';
  @Output() onConfirm = new EventEmitter<DetectionFormData>();
  @Output() onCancel = new EventEmitter<void>();

  formData: DetectionFormData = {
    patientName: '',
    patientId: this.generatePatientId(),
    bodyRegion: '',
    fractureType: '',
    fractureLocation: '',
    severity: 'medium',
    saveToHistory: true
  };

  private generatePatientId(): string {
    const year = new Date().getFullYear();
    const num = String(Math.floor(Math.random() * 9999)).padStart(4, '0');
    return `P-${year}-${num}`;
  }

  confirm(): void {
    this.onConfirm.emit(this.formData);
  }

  cancel(): void {
    this.onCancel.emit();
  }

  getDetectionsSummary(): string {
    if (this.detections.length === 0) return 'Nenhuma detecção';
    return this.detections
      .map(d => `${d.class_name} (${(d.confidence * 100).toFixed(1)}%)`)
      .join(', ');
  }
}
