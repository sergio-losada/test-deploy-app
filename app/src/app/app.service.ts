import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  protected headers: HttpHeaders;
  private url = environment.API_URL;

  constructor(private http: HttpClient) {
    this.headers = new HttpHeaders();
    this.headers = this.headers.set("Content-Type", "application/json");

    const jwt = localStorage.getItem("jwt");
    if (jwt) {
      this.headers = this.headers.set("Authorization", jwt);
    }
  }

  public signin(): Observable<any> {
    return this.http.get<any>(this.url, { observe: 'response', headers: this.headers } );
  }
}
