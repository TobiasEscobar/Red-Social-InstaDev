import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { DashboardService } from '../../../services/dashboard.service';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './statistics.html',
  styleUrl: './statistics.css'
})
export class StatisticsComponent implements OnInit {
  
  startDate: string = '';
  endDate: string = '';

  public barChartOptions: ChartConfiguration['options'] = { responsive: true };
  public pieChartOptions: ChartConfiguration['options'] = { responsive: true }; 
  public lineChartOptions: ChartConfiguration['options'] = { responsive: true };

  public barChartData: ChartData<'bar'> = { labels: [], datasets: [{ data: [], label: 'Publicaciones' }] };
  public pieChartData: ChartData<'pie'> = { labels: [], datasets: [{ data: [] }] };
  public lineChartData: ChartData<'line'> = { labels: [], datasets: [{ data: [], label: 'Comentarios' }] };

  constructor(private dashboardService: DashboardService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    // Inicializamos fechas por defecto (último mes)
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 1);
    
    this.endDate = end.toISOString().split('T')[0];
    this.startDate = start.toISOString().split('T')[0];

    this.cargarDatos();
  }

  cargarDatos() {
    this.dashboardService.getStats(this.startDate, this.endDate).subscribe({
      next: (data) => {
        // 1. Gráfico de Barras
        const users = data.postsByUser.map((u: any) => u.username);
        const counts = data.postsByUser.map((u: any) => u.count);
        
        this.barChartData = {
          labels: users,
          datasets: [{ data: counts, label: 'Publicaciones por Usuario', backgroundColor: '#8b5cf6' }]
        };

        // 2. Gráfico de Torta
        const postTitles = data.commentsByPost.map((p: any) => p.titulo);
        const commentCounts = data.commentsByPost.map((p: any) => p.commentCount);

        this.pieChartData = {
          labels: postTitles,
          datasets: [{ data: commentCounts }]
        };

        // 3. Gráfico de Línea
        const timeLabels = data.commentsOverTime.map((d: any) => d._id.dateStr);
        const timeCounts = data.commentsOverTime.map((d: any) => d.count);
        
        this.lineChartData = {
            labels: timeLabels,
            datasets: [{ data: timeCounts, label: 'Comentarios por mes'}]
        };
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }

  updateCharts() {
    console.log('Filtrando desde', this.startDate, 'hasta', this.endDate);
    this.cargarDatos();
    this.cdr.detectChanges();
  }
}