// src/main/webapp/app/core/keycloak/keycloak-sync.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface KeycloakSyncResult {
  created: number;
  updated: number;
  skipped: number;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class KeycloakSyncService {
  constructor(private http: HttpClient) {}

  syncNow(): Observable<KeycloakSyncResult> {
    return this.http.post<KeycloakSyncResult>('/api/admin/keycloak/sync', {});
  }
}
