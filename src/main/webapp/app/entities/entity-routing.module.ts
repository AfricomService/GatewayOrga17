import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

// Rôles autorisés (même logique que la sidebar)
const ADMIN_RH_USER = ['ROLE_ADMIN', 'ROLE_RH', 'ROLE_USER'];
const ADMIN_RH = ['ROLE_ADMIN', 'ROLE_RH'];

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: 'absence',
        data: { authorities: ADMIN_RH, pageTitle: 'orgacaregatewayApp.orgaCareAbsence.home.title' },
        canActivate: [UserRouteAccessService],
        loadChildren: () => import('./OrgaCare/absence/absence.module').then(m => m.OrgaCareAbsenceModule),
      },
      {
        path: 'affectation',
        data: { authorities: ADMIN_RH, pageTitle: 'orgacaregatewayApp.orgaCareAffectation.home.title' },
        canActivate: [UserRouteAccessService],
        loadChildren: () => import('./OrgaCare/affectation/affectation.module').then(m => m.OrgaCareAffectationModule),
      },
      {
        path: 'contrat',
        data: { authorities: ADMIN_RH, pageTitle: 'orgacaregatewayApp.orgaCareContrat.home.title' },
        canActivate: [UserRouteAccessService],
        loadChildren: () => import('./OrgaCare/contrat/contrat.module').then(m => m.OrgaCareContratModule),
      },
      {
        path: 'departement',
        data: { authorities: ADMIN_RH_USER, pageTitle: 'orgacaregatewayApp.orgaCareDepartement.home.title' },
        canActivate: [UserRouteAccessService],
        loadChildren: () => import('./OrgaCare/departement/departement.module').then(m => m.OrgaCareDepartementModule),
      },
      {
        path: 'employe-created-event',
        data: { authorities: ADMIN_RH, pageTitle: 'orgacaregatewayApp.orgaCareEmployeCreatedEvent.home.title' },
        canActivate: [UserRouteAccessService],
        loadChildren: () =>
          import('./OrgaCare/employe-created-event/employe-created-event.module').then(m => m.OrgaCareEmployeCreatedEventModule),
      },
      {
        path: 'fonction',
        data: { authorities: ADMIN_RH, pageTitle: 'orgacaregatewayApp.orgaCareFonction.home.title' },
        canActivate: [UserRouteAccessService],
        loadChildren: () => import('./OrgaCare/fonction/fonction.module').then(m => m.OrgaCareFonctionModule),
      },
      {
        path: 'forme-juridique',
        data: { authorities: ADMIN_RH, pageTitle: 'orgacaregatewayApp.orgaCareFormeJuridique.home.title' },
        canActivate: [UserRouteAccessService],
        loadChildren: () => import('./OrgaCare/forme-juridique/forme-juridique.module').then(m => m.OrgaCareFormeJuridiqueModule),
      },
      {
        path: 'grade',
        data: { authorities: ADMIN_RH, pageTitle: 'orgacaregatewayApp.orgaCareGrade.home.title' },
        canActivate: [UserRouteAccessService],
        loadChildren: () => import('./OrgaCare/grade/grade.module').then(m => m.OrgaCareGradeModule),
      },
      {
        path: 'groupe',
        data: { authorities: ADMIN_RH, pageTitle: 'orgacaregatewayApp.orgaCareGroupe.home.title' },
        canActivate: [UserRouteAccessService],
        loadChildren: () => import('./OrgaCare/groupe/groupe.module').then(m => m.OrgaCareGroupeModule),
      },
      {
        path: 'organigramme',
        data: { authorities: ADMIN_RH_USER, pageTitle: 'orgacaregatewayApp.orgaCareOrganigramme.home.title' },
        canActivate: [UserRouteAccessService],
        loadChildren: () => import('./OrgaCare/organigramme/organigramme.module').then(m => m.OrgaCareOrganigrammeModule),
      },
      {
        path: 'personne',
        data: { authorities: ADMIN_RH_USER, pageTitle: 'orgacaregatewayApp.orgaCarePersonne.home.title' },
        canActivate: [UserRouteAccessService],
        loadChildren: () => import('./OrgaCare/personne/personne.module').then(m => m.OrgaCarePersonneModule),
      },
      {
        path: 'site',
        data: { authorities: ADMIN_RH_USER, pageTitle: 'orgacaregatewayApp.orgaCareSite.home.title' },
        canActivate: [UserRouteAccessService],
        loadChildren: () => import('./OrgaCare/site/site.module').then(m => m.OrgaCareSiteModule),
      },
      {
        path: 'societe',
        data: { authorities: ADMIN_RH_USER, pageTitle: 'orgacaregatewayApp.orgaCareSociete.home.title' },
        canActivate: [UserRouteAccessService],
        loadChildren: () => import('./OrgaCare/societe/societe.module').then(m => m.OrgaCareSocieteModule),
      },
      {
        path: 'status-history',
        data: { authorities: ADMIN_RH, pageTitle: 'orgacaregatewayApp.orgaCareStatusHistory.home.title' },
        canActivate: [UserRouteAccessService],
        loadChildren: () => import('./OrgaCare/status-history/status-history.module').then(m => m.OrgaCareStatusHistoryModule),
      },
      {
        path: 'type-contrat',
        data: { authorities: ADMIN_RH, pageTitle: 'orgacaregatewayApp.orgaCareTypeContrat.home.title' },
        canActivate: [UserRouteAccessService],
        loadChildren: () => import('./OrgaCare/type-contrat/type-contrat.module').then(m => m.OrgaCareTypeContratModule),
      },
      /* jhipster-needle-add-entity-route - JHipster will add entity modules routes here */
    ]),
  ],
})
export class EntityRoutingModule {}
