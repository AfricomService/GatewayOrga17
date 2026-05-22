import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: 'absence',
        data: { pageTitle: 'orgacaregatewayApp.orgaCareAbsence.home.title' },
        loadChildren: () => import('./OrgaCare/absence/absence.module').then(m => m.OrgaCareAbsenceModule),
      },
      {
        path: 'affectation',
        data: { pageTitle: 'orgacaregatewayApp.orgaCareAffectation.home.title' },
        loadChildren: () => import('./OrgaCare/affectation/affectation.module').then(m => m.OrgaCareAffectationModule),
      },
      {
        path: 'contrat',
        data: { pageTitle: 'orgacaregatewayApp.orgaCareContrat.home.title' },
        loadChildren: () => import('./OrgaCare/contrat/contrat.module').then(m => m.OrgaCareContratModule),
      },
      {
        path: 'departement',
        data: { pageTitle: 'orgacaregatewayApp.orgaCareDepartement.home.title' },
        loadChildren: () => import('./OrgaCare/departement/departement.module').then(m => m.OrgaCareDepartementModule),
      },
      {
        path: 'employe-created-event',
        data: { pageTitle: 'orgacaregatewayApp.orgaCareEmployeCreatedEvent.home.title' },
        loadChildren: () =>
          import('./OrgaCare/employe-created-event/employe-created-event.module').then(m => m.OrgaCareEmployeCreatedEventModule),
      },
      {
        path: 'fonction',
        data: { pageTitle: 'orgacaregatewayApp.orgaCareFonction.home.title' },
        loadChildren: () => import('./OrgaCare/fonction/fonction.module').then(m => m.OrgaCareFonctionModule),
      },
      {
        path: 'forme-juridique',
        data: { pageTitle: 'orgacaregatewayApp.orgaCareFormeJuridique.home.title' },
        loadChildren: () => import('./OrgaCare/forme-juridique/forme-juridique.module').then(m => m.OrgaCareFormeJuridiqueModule),
      },
      {
        path: 'grade',
        data: { pageTitle: 'orgacaregatewayApp.orgaCareGrade.home.title' },
        loadChildren: () => import('./OrgaCare/grade/grade.module').then(m => m.OrgaCareGradeModule),
      },
      {
        path: 'groupe',
        data: { pageTitle: 'orgacaregatewayApp.orgaCareGroupe.home.title' },
        loadChildren: () => import('./OrgaCare/groupe/groupe.module').then(m => m.OrgaCareGroupeModule),
      },
      {
        path: 'organigramme',
        data: { pageTitle: 'orgacaregatewayApp.orgaCareOrganigramme.home.title' },
        loadChildren: () => import('./OrgaCare/organigramme/organigramme.module').then(m => m.OrgaCareOrganigrammeModule),
      },
      {
        path: 'personne',
        data: { pageTitle: 'orgacaregatewayApp.orgaCarePersonne.home.title' },
        loadChildren: () => import('./OrgaCare/personne/personne.module').then(m => m.OrgaCarePersonneModule),
      },
      {
        path: 'site',
        data: { pageTitle: 'orgacaregatewayApp.orgaCareSite.home.title' },
        loadChildren: () => import('./OrgaCare/site/site.module').then(m => m.OrgaCareSiteModule),
      },
      {
        path: 'societe',
        data: { pageTitle: 'orgacaregatewayApp.orgaCareSociete.home.title' },
        loadChildren: () => import('./OrgaCare/societe/societe.module').then(m => m.OrgaCareSocieteModule),
      },
      {
        path: 'status-history',
        data: { pageTitle: 'orgacaregatewayApp.orgaCareStatusHistory.home.title' },
        loadChildren: () => import('./OrgaCare/status-history/status-history.module').then(m => m.OrgaCareStatusHistoryModule),
      },
      {
        path: 'type-contrat',
        data: { pageTitle: 'orgacaregatewayApp.orgaCareTypeContrat.home.title' },
        loadChildren: () => import('./OrgaCare/type-contrat/type-contrat.module').then(m => m.OrgaCareTypeContratModule),
      },
      /* jhipster-needle-add-entity-route - JHipster will add entity modules routes here */
    ]),
  ],
})
export class EntityRoutingModule {}
