import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import * as XLSX from 'xlsx'; // Librería para Excel
import * as Papa from 'papaparse';
@Component({
  selector: 'app-reporte-peliculas',
  templateUrl: './reporte-peliculas.component.html',
  styleUrls: ['./reporte-peliculas.component.css']
})
export class ReportePeliculasComponent implements OnInit {
  peliculas: any[] = [];
  peliculasFiltradas: any[] = [];
  generos: string[] = [];
  filtroGenero: string = '';
  filtroAnio: number | null = null;

  constructor(private http: HttpClient) {
    (<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;
  }

  ngOnInit() {
    this.http.get<any[]>('./assets/peliculas.json').subscribe(data => {
      this.peliculas = data;
      this.peliculasFiltradas = [...this.peliculas]; // Inicialmente, las películas filtradas son todas las películas
      this.generos = this.obtenerGeneros();
    });
  }

  generarPDF() {
    const contenido = [
      { text: 'Informe de Películas', style: 'header' },
      { text: '\n\n' },
      {
        table: {
          headerRows: 1,
          widths: ['*', '*', '*'],
          body: [
            ['Título', 'Género', 'Año de lanzamiento'],
            ...this.peliculasFiltradas.map(pelicula => [pelicula.titulo, pelicula.genero, pelicula.lanzamiento.toString()])
          ]
        }
      }
    ];

    const estilos = {
      header: {
        fontSize: 18,
        bold: true,
        alignment: 'center',
        color: '#3498db' // Color de texto
      },
      tableHeader: {
        bold: true,
        fontSize: 12,
        color: '#ffffff', // Color de fondo
        fillColor: '#ecf0f1' // Color de la celda
      },
      tableBody: {
        fontSize: 10
      }
    };

    const documentDefinition = {
      content: contenido,
      styles: estilos as any
    };

    pdfMake.createPdf(documentDefinition).open();
  }

  aplicarFiltros() {
    this.peliculasFiltradas = this.peliculas.filter(pelicula => {
      const cumpleFiltroGenero = this.filtroGenero ? pelicula.genero === this.filtroGenero : true;
      const cumpleFiltroAnio = this.filtroAnio !== null ? pelicula.lanzamiento === this.filtroAnio : true;
      return cumpleFiltroGenero && cumpleFiltroAnio;
    });
  }

  obtenerGeneros() {
    return Array.from(new Set(this.peliculas.map(pelicula => pelicula.genero)));
  }

  exportarExcel() {
    const data = this.peliculasFiltradas.map(pelicula => ({
      'Título': pelicula.titulo,
      'Género': pelicula.genero,
      'Año de lanzamiento': pelicula.lanzamiento.toString()
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'InformePeliculas');
    XLSX.writeFile(wb, 'InformePeliculas.xlsx');
  }

  exportarCSV() {
    const csv = Papa.unparse(this.peliculasFiltradas.map(pelicula => ({
      'Título': pelicula.titulo,
      'Género': pelicula.genero,
      'Año de lanzamiento': pelicula.lanzamiento.toString()
    })));

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'InformePeliculas.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}

