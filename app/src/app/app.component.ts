import { Component, OnInit } from '@angular/core';
import { AppService } from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {

  protected title: string;

  constructor(
    private appService: AppService
  ) {
    this.title = "";
  }
  
  ngOnInit(): void {
    this.appService.signin().subscribe({
      next: (response) => {
        this.title = response.body![0].name;
      },
      error: (err) => {
        console.error('Error al iniciar sesión:', err);
      }
    });
  }
  
}
