import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../environments/environment';
import {EnterpriseCreate} from '../models/enterprise-create.model';

@Injectable({
  providedIn: 'root'
})
export class EnterpriseService {

  enterpriseUrl = `${environment.userUrl}/api/enterprises`;
  modulesUrl = `${environment.userUrl}/api/modules`;
  featureUrl = `${environment.userUrl}/api/features`;
  enterpriseTypeFeaturesUrl = `${environment.userUrl}/api/enterprise-type-features`;

  constructor(private http: HttpClient) { }

  getAllEnterprises() {
    return this.http.get(`${this.enterpriseUrl}?page=0&size=1000`);
  }

  createEnterprise(enterpriseCreateModel: EnterpriseCreate) {
    return this.http.post(this.enterpriseUrl, enterpriseCreateModel);
  }

  getModulesByEnterpriseId(enterpriseId: number) {
    return this.http.get(`${this.modulesUrl}/${enterpriseId}/features-summary`);
  }

  getEnterpriseByType(enterpriseType: string) {
    return this.http.get(`${this.modulesUrl}/enterprise-type/${enterpriseType}/features`);
  }

  getFeatureByModuleIdAndType(moduleId: number, enterpriseType: string) {
    return this.http.get(`${this.modulesUrl}/enterprise-type/${enterpriseType}/features?moduleId=${moduleId}`);
  }

  addModule(body) {
    return this.http.post(`${this.modulesUrl}`, body);
  }

  addFeature(body) {
    return this.http.post(`${this.featureUrl}`, body);
  }

  typeFeatureAdd(body) {
    return this.http.post(`${this.enterpriseTypeFeaturesUrl}`, body);
  }

  getRole() {
    return this.http.get(`${environment.userUrl}/api/roles`);
  }

  getRolesByEnterpriseId(enterpriseId: number) {
    return this.http.get(`${environment.userUrl}/new-role/summary/${enterpriseId}`);
  }

  getUsers(page: number = 0, size: number = 30) {
    return this.http.get(`${environment.userUrl}/api/users?page=${page}&size=${size}`);
  }
}
