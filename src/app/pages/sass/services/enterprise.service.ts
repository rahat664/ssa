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
  updateEnterprise(enterpriseId: number, enterpriseCreateModel: EnterpriseCreate) {
    return this.http.put(`${this.enterpriseUrl}/${enterpriseId}`, enterpriseCreateModel);
  }

  getModulesByEnterpriseId(enterpriseId: number, moduleId?: number) {
    if (moduleId !== undefined) {
      return this.http.get(`${this.modulesUrl}/${enterpriseId}/features-summary?moduleId=${moduleId}`);
    }
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


  getRolesByEnterpriseId(enterpriseId: number, moduleId?: number) {
    if (moduleId !== undefined) {
      return this.http.get(`${environment.userUrl}/new-role/summary/${enterpriseId}?moduleId=${moduleId}`);
    }
    return this.http.get(`${environment.userUrl}/new-role/summary/${enterpriseId}`);
  }



  getUsersByEnterpriseId(enterpriseId: number, page: number = 0, searchTerm: string = '') {
    let url = `${environment.userUrl}/api/users/all?enterpriseId=${enterpriseId}&page=${page}`;
    if (searchTerm) {
      url += `&searchParam=${encodeURIComponent(searchTerm)}`;
    }
    return this.http.get(url);
  }

  getUserSummaryById(userId: number | string, roleId?: number) {
    if (roleId !== undefined) {
      return this.http.get(`${environment.userUrl}/new-user-role/summary/${userId}/${roleId}`);
    }
    return this.http.get(`${environment.userUrl}/new-user-role/summary/${userId}`);
  }

  getUserSummaryByEnterpriseId(enterpriseId: number | string, userId?: number | string, moduleId?:number) {
    if (moduleId !== undefined) {
      return this.http.get(`${environment.userUrl}/new-user-role/summary?enterpriseId=${enterpriseId}&userId=${userId}&moduleId=${moduleId}`);
    }
    return this.http.get(`${environment.userUrl}/new-user-role/summary?enterpriseId=${enterpriseId}&userId=${userId}`);
  }


  getRoleByUserId(userId: number | string) {
    return this.http.get(`${environment.userUrl}/new-user-role/list/${userId}`);
  }

  addEnterpriseIdFeature(body) {
    return this.http.post(`${environment.userUrl}/api/enterprise-features/save`, body);
  }

  roleFeatureUpdate(body) {
    return this.http.put(`${environment.userUrl}/new-role`, body);
  }

  assignRoleToUser(body: any) {
    return this.http.put(`${environment.userUrl}/new-user-role`, body);
  }

  updateUserPermission(body) {
    return this.http.put(`${environment.userUrl}/new-user-role`, body);
  }

  getUserById(userId: number | string) {
    return this.http.get(`${environment.userUrl}/api/users/user-id/sl-${userId}`);
  }


}
