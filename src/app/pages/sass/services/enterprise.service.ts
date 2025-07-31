import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EnterpriseService {

  enterpriseUrl = `${environment.userUrl}/api/enterprises`;

  constructor(private http: HttpClient) { }

  getAllEnterprises() {
    return this.http.get(this.enterpriseUrl)
  }
}
