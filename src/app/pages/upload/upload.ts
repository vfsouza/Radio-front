import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { DetectionHistoryService, HistoryItem } from '../../services/detection-history.service';
import { DetectionModal, DetectionFormData } from '../../components/detection-modal/detection-modal';

interface Detection {
  class: number;
  class_name: string;
  confidence: number;
  bbox: number[]; // [x1, y1, x2, y2]
}

interface FilePreview {
  file: File;
  name: string;
  size: number;
  preview: string;
  uploading?: boolean;
  uploadProgress?: number;
  uploadError?: string;
  uploadSuccess?: boolean;
  detections?: Detection[];
  annotatedImage?: string; // Imagem com as bbox desenhadas
}

interface DetectionResponse {
  success: boolean;
  detections?: Detection[];
  image_name?: string;
  image_size?: number;
  message?: string;
  error?: string;
}

@Component({
  selector: 'app-upload',
  imports: [CommonModule, DetectionModal],
  templateUrl: './upload.html',
  styleUrl: './upload.css',
})

export class Upload {
  private cdr = inject(ChangeDetectorRef);
  private http = inject(HttpClient);
  private historyService = inject(DetectionHistoryService);

  selectedFiles: FilePreview[] = [];
  isDragging = false;
  isUploading = false;
  showModal = false;
  currentFilePreview?: FilePreview;
  currentResponse?: DetectionResponse;

  private readonly API_URL = 'https://web-production-529f.up.railway.app/api/detect/';

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files) {
      this.handleFiles(files);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(input.files);
    }
  }

  private handleFiles(files: FileList): void {
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.selectedFiles.push({
            file: file,
            name: file.name,
            size: file.size,
            preview: e.target?.result as string
          });
          // Força a detecção de mudanças do Angular
          this.cdr.detectChanges();
        };
        reader.readAsDataURL(file);
      }
    });
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  clearAll(): void {
    this.selectedFiles = [];
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  async uploadFiles(): Promise<void> {
    if (this.selectedFiles.length === 0) {
      alert('Nenhuma radiografia selecionada!');
      return;
    }

    this.isUploading = true;

    // Processar cada arquivo individualmente
    for (let i = 0; i < this.selectedFiles.length; i++) {
      const filePreview = this.selectedFiles[i];

      // Marcar como fazendo upload
      filePreview.uploading = true;
      filePreview.uploadProgress = 0;
      this.cdr.detectChanges();

      try {
        const formData = new FormData();
        formData.append('image', filePreview.file);

        // Fazer requisição para a API
        const response = await this.http.post<DetectionResponse>(
          this.API_URL,
          formData
        ).toPromise();

        console.log(`Resposta da API para ${filePreview.name}:`, response);

        // Armazenar detecções
        if (response?.detections && response.detections.length > 0) {
          filePreview.detections = response.detections;

          // Desenhar bounding boxes na imagem
          await this.drawBoundingBoxes(filePreview);
        }

        // Marcar como sucesso
        filePreview.uploading = false;
        filePreview.uploadProgress = 100;
        filePreview.uploadSuccess = true;
        this.cdr.detectChanges();

        // Mostrar modal para o médico preencher informações
        if (response) {
          this.currentFilePreview = filePreview;
          this.currentResponse = response;
          this.showModal = true;
        }

      } catch (error: any) {
        console.error(`Erro ao enviar ${filePreview.name}:`, error);

        filePreview.uploading = false;
        filePreview.uploadError = error.error?.message || error.message || 'Erro ao enviar a imagem';
        this.cdr.detectChanges();

        alert(`Erro ao analisar ${filePreview.name}:\n${filePreview.uploadError}`);
      }
    }

    // Usar setTimeout para evitar ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      this.isUploading = false;
      this.cdr.detectChanges();
    }, 0);
  }

  onModalConfirm(formData: DetectionFormData): void {
    if (!this.currentFilePreview) return;

    const detections = this.currentFilePreview.detections || [];
    const avgConfidence = detections.length > 0
      ? detections.reduce((sum, d) => sum + d.confidence, 0) / detections.length
      : 0;

    const historyItem: HistoryItem = {
      id: `det-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      patientId: formData.patientId,
      patientName: formData.patientName || 'Paciente Anônimo',
      bodyRegion: formData.bodyRegion,
      fractureType: formData.fractureType || detections.map(d => d.class_name).join(', '),
      fractureLocation: formData.fractureLocation,
      imageUrl: this.currentFilePreview.annotatedImage || this.currentFilePreview.preview,
      timestamp: new Date(),
      status: detections.length > 0 ? 'success' : 'failed',
      confidence: avgConfidence > 0 ? Math.round(avgConfidence * 100) : undefined,
      severity: formData.severity,
      detections: detections,
      fileName: this.currentFilePreview.name
    };

    // Salvar no histórico apenas se o médico marcou a opção
    if (formData.saveToHistory) {
      this.historyService.addDetection(historyItem);
    }

    // Fechar modal
    this.showModal = false;
    this.currentFilePreview = undefined;
    this.currentResponse = undefined;
  }

  onModalCancel(): void {
    this.showModal = false;
    this.currentFilePreview = undefined;
    this.currentResponse = undefined;
  }

  private async drawBoundingBoxes(filePreview: FilePreview): Promise<void> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        // Criar canvas com as mesmas dimensões da imagem
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;

        // Desenhar a imagem original
        ctx.drawImage(img, 0, 0);

        // Desenhar cada bounding box
        filePreview.detections?.forEach((detection, index) => {
          const [x1, y1, x2, y2] = detection.bbox;
          const width = x2 - x1;
          const height = y2 - y1;

          // Gerar cor baseada no índice
          const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
            '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
          ];
          const color = colors[index % colors.length];

          // Desenhar retângulo
          ctx.strokeStyle = color;
          ctx.lineWidth = 3;
          ctx.strokeRect(x1, y1, width, height);

          // Desenhar fundo do label
          const label = `${detection.class_name} ${(detection.confidence * 100).toFixed(1)}%`;
          ctx.font = 'bold 16px Arial';
          const textMetrics = ctx.measureText(label);
          const textHeight = 20;

          ctx.fillStyle = color;
          ctx.fillRect(x1, y1 - textHeight - 4, textMetrics.width + 8, textHeight + 4);

          // Desenhar texto
          ctx.fillStyle = '#FFFFFF';
          ctx.fillText(label, x1 + 4, y1 - 8);
        });

        // Converter canvas para data URL e armazenar
        filePreview.annotatedImage = canvas.toDataURL();
        resolve();
      };
      img.src = filePreview.preview;
    });
  }
}
