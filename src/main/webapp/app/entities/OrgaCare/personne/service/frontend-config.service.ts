import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApplicationConfigService } from 'app/core/config/application-config.service';

export interface IKeycloakFrontendConfig {
  adminUserCreateUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class FrontendConfigService {
  protected keycloakConfigUrl = this.applicationConfigService.getEndpointFor('api/frontend-config/keycloak');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  getKeycloakConfig(): Observable<IKeycloakFrontendConfig> {
    return this.http.get<IKeycloakFrontendConfig>(this.keycloakConfigUrl);
  }
}
