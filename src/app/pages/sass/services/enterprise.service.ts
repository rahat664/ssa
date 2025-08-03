import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../environments/environment';
import {EnterpriseCreate} from '../models/enterprise-create.model';

@Injectable({
  providedIn: 'root'
})
export class EnterpriseService {

  enterpriseUrl = `${environment.userUrl}/api/enterprises`;

  constructor(private http: HttpClient) { }

  getAllEnterprises() {
    return this.http.get(this.enterpriseUrl)
  }

  createEnterprise(enterpriseCreateModel: EnterpriseCreate) {
    return this.http.post(this.enterpriseUrl, enterpriseCreateModel);
  }
}
