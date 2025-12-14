import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DetectionHistoryService, HistoryItem } from '../../services/detection-history.service';
import { Subscription } from 'rxjs';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-history',
  imports: [CommonModule, FormsModule],
  templateUrl: './history.html',
  styleUrl: './history.css',
})
export class History implements OnInit, OnDestroy {
  historyItems: HistoryItem[] = [];
  filteredItems: HistoryItem[] = [];
  selectedStatus: string = 'all';
  sortBy: string = 'date-desc';
  searchText: string = '';
  private subscription?: Subscription;

  constructor(private historyService: DetectionHistoryService) {}

  ngOnInit(): void {
    // Inscrever-se para atualizações em tempo real
    this.subscription = this.historyService.historyItems$.subscribe((items: HistoryItem[]) => {
      this.historyItems = items;
      this.applyFilters();
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  applyFilters(): void {
    this.filteredItems = this.historyItems.filter(item => {
      const matchesStatus = this.selectedStatus === 'all' || item.status === this.selectedStatus;
      const matchesSearch = !this.searchText ||
        item.patientName.toLowerCase().includes(this.searchText.toLowerCase()) ||
        item.patientId.toLowerCase().includes(this.searchText.toLowerCase()) ||
        item.bodyRegion.toLowerCase().includes(this.searchText.toLowerCase()) ||
        (item.fractureType && item.fractureType.toLowerCase().includes(this.searchText.toLowerCase()));
      return matchesStatus && matchesSearch;
    });
    this.applySort();
  }

  applySort(): void {
    this.filteredItems.sort((a, b) => {
      switch (this.sortBy) {
        case 'date-desc':
          return b.timestamp.getTime() - a.timestamp.getTime();
        case 'date-asc':
          return a.timestamp.getTime() - b.timestamp.getTime();
        case 'title':
          return a.patientName.localeCompare(b.patientName);
        default:
          return 0;
      }
    });
  }

  getSuccessCount(): number {
    return this.historyItems.filter(item => item.status === 'success').length;
  }

  getFailedCount(): number {
    return this.historyItems.filter(item => item.status === 'failed').length;
  }

  formatDate(date: Date): string {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoje';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ontem';
    } else {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  viewDetails(item: HistoryItem): void {
    console.log('Ver detalhes:', item);
    // Implementar modal com detalhes completos da análise
    // Pode incluir: imagem ampliada, marcações da IA, recomendações médicas, etc.
  }

  getSeverityLabel(severity?: string): string {
    switch (severity) {
      case 'low':
        return 'Leve';
      case 'medium':
        return 'Moderada';
      case 'high':
        return 'Grave';
      default:
        return '';
    }
  }

  getSeverityColor(severity?: string): string {
    switch (severity) {
      case 'low':
        return '#48bb78';
      case 'medium':
        return '#ed8936';
      case 'high':
        return '#f56565';
      default:
        return '#718096';
    }
  }

  deleteItem(id: string): void {
    if (confirm('Tem certeza que deseja excluir este item do histórico?')) {
      this.historyService.deleteItem(id);
    }
  }

  clearAllHistory(): void {
    if (confirm('Tem certeza que deseja limpar todo o histórico?')) {
      this.historyService.clearAll();
    }
  }

  async downloadReport(item: HistoryItem): Promise<void> {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;

    // Cabeçalho com gradiente simulado
    pdf.setFillColor(102, 126, 234);
    pdf.rect(0, 0, pageWidth, 45, 'F');

    pdf.setFillColor(118, 75, 162);
    pdf.rect(0, 35, pageWidth, 10, 'F');

    // Título
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Relatório de Análise', margin, 25);

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Sistema de Detecção de Fraturas por IA', margin, 35);

    // Resetar cor do texto
    pdf.setTextColor(0, 0, 0);
    yPosition = 60;

    // Informações do Paciente
    pdf.setFillColor(247, 250, 252);
    pdf.rect(margin, yPosition, pageWidth - 2 * margin, 50, 'F');

    yPosition += 10;
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Informações do Paciente', margin + 5, yPosition);

    yPosition += 8;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    pdf.text(`Nome: ${item.patientName}`, margin + 5, yPosition);
    yPosition += 6;
    pdf.text(`ID do Paciente: ${item.patientId}`, margin + 5, yPosition);
    yPosition += 6;
    pdf.text(`Região do Corpo: ${item.bodyRegion}`, margin + 5, yPosition);
    yPosition += 6;
    pdf.text(`Data: ${this.formatDate(item.timestamp)} às ${this.formatTime(item.timestamp)}`, margin + 5, yPosition);

    if (item.fileName) {
      yPosition += 6;
      pdf.text(`Arquivo: ${item.fileName}`, margin + 5, yPosition);
    }

    yPosition += 15;

    // Resultados da Análise
    pdf.setFillColor(237, 242, 247);
    pdf.rect(margin, yPosition, pageWidth - 2 * margin, item.fractureLocation ? 44 : 38, 'F');

    yPosition += 10;
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Resultados da Análise', margin + 5, yPosition);

    yPosition += 8;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    const statusText = item.status === 'success' ? 'Fratura Detectada' : 'Nenhuma Fratura Detectada';
    const statusColor = item.status === 'success' ? [72, 187, 120] : [245, 101, 101];
    pdf.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Status: ${statusText}`, margin + 5, yPosition);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'normal');

    if (item.status === 'success') {
      if (item.fractureType) {
        yPosition += 6;
        pdf.text(`Tipo de Fratura: ${item.fractureType}`, margin + 5, yPosition);
      }

      if (item.fractureLocation) {
        yPosition += 6;
        pdf.text(`Localização: ${item.fractureLocation}`, margin + 5, yPosition);
      }

      if (item.confidence) {
        yPosition += 6;
        pdf.text(`Confiança da IA: ${item.confidence}%`, margin + 5, yPosition);
      }

      if (item.severity) {
        yPosition += 6;
        const severityLabel = this.getSeverityLabel(item.severity);
        pdf.text(`Severidade: ${severityLabel}`, margin + 5, yPosition);
      }
    }

    yPosition += 15;

    // Imagem da Radiografia
    if (item.imageUrl && item.status === 'success') {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Radiografia Analisada', margin + 5, yPosition);
      yPosition += 8;

      try {
        // Converter imagem para base64 se necessário e adicionar ao PDF
        const imgData = await this.getImageAsBase64(item.imageUrl);
        const imgWidth = pageWidth - 2 * margin - 10;
        const imgHeight = 120;

        if (yPosition + imgHeight > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }

        pdf.addImage(imgData, 'PNG', margin + 5, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 10;
      } catch (error) {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'italic');
        pdf.setTextColor(150, 150, 150);
        pdf.text('Imagem não disponível para exportação', margin + 5, yPosition);
        pdf.setTextColor(0, 0, 0);
        yPosition += 10;
      }
    }

    // Detecções da IA
    if (item.detections && item.detections.length > 0) {
      if (yPosition > pageHeight - 60) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Detecções da Inteligência Artificial', margin + 5, yPosition);
      yPosition += 8;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');

      item.detections.forEach((detection, index) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = margin;
        }

        pdf.text(`${index + 1}. ${detection.class_name} - Confiança: ${(detection.confidence * 100).toFixed(1)}%`, margin + 5, yPosition);
        yPosition += 6;
      });

      yPosition += 10;
    }

    // Disclaimer
    if (yPosition > pageHeight - 50) {
      pdf.addPage();
      yPosition = margin;
    }

    pdf.setFillColor(255, 243, 205);
    pdf.rect(margin, yPosition, pageWidth - 2 * margin, 35, 'F');

    yPosition += 8;
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(120, 53, 15);
    pdf.text('Aviso Importante', margin + 5, yPosition);

    yPosition += 6;
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    const disclaimerLines = pdf.splitTextToSize(
      'Este relatório foi gerado por um sistema de Inteligência Artificial e serve apenas como ferramenta de apoio ao diagnóstico médico. Não substitui a avaliação de um profissional qualificado. Os resultados podem conter falsos positivos ou negativos. Sempre consulte um médico especialista para diagnóstico definitivo.',
      pageWidth - 2 * margin - 10
    );
    pdf.text(disclaimerLines, margin + 5, yPosition);

    // Rodapé
    pdf.setTextColor(150, 150, 150);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'italic');
    const footerText = `Relatório gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`;
    pdf.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });

    // Download do PDF
    const fileName = `relatorio_${item.patientId}_${item.timestamp.getTime()}.pdf`;
    pdf.save(fileName);
  }

  private async getImageAsBase64(imageUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } else {
          reject(new Error('Failed to get canvas context'));
        }
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageUrl;
    });
  }
}
