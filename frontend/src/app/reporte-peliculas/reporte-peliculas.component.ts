import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

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
        bold: true
      }
    };

    const documentDefinition = {
      content: contenido,
      styles: estilos
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
}
