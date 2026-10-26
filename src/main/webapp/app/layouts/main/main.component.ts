import { Component, OnInit, RendererFactory2, Renderer2 } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRouteSnapshot, NavigationEnd } from '@angular/router';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import * as dayjs from 'dayjs';

import { AccountService } from 'app/core/auth/account.service';
import { FindLanguageFromKeyPipe } from 'app/shared/language/find-language-from-key.pipe';
import { LoginService } from 'app/login/login.service';
import { Account } from 'app/core/auth/account.model';

@Component({
  selector: 'jhi-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnInit {
  // ── Public avant private (règle ESLint member-ordering) ──────────
  account: Account | null = null;
  sidebarCollapsed = false;

  currentLang = 'fr';

  // Sections de la sidebar : seule "principal" est ouverte au départ
  openSections: Record<string, boolean> = {
    principal: true,
    organisation: false,
    rh: false,
    referentiels: false,
    administration: false,
  };

  private renderer: Renderer2;

  private readonly sectionRoutes: { key: string; prefixes: string[] }[] = [
    { key: 'organisation', prefixes: ['/societe', '/site', '/departement', '/organigramme'] },
    { key: 'rh', prefixes: ['/personne', '/session-formation', '/formation', '/contrat', '/absence'] },
    { key: 'referentiels', prefixes: ['/grade', '/fonction', '/type-contrat', '/forme-juridique', '/theme-formation', '/formateur'] },
    { key: 'administration', prefixes: ['/admin'] },
  ];

  constructor(
    private accountService: AccountService,
    private loginService: LoginService,
    private titleService: Title,
    private router: Router,
    private findLanguageFromKeyPipe: FindLanguageFromKeyPipe,
    private translateService: TranslateService,
    rootRenderer: RendererFactory2
  ) {
    this.renderer = rootRenderer.createRenderer(document.querySelector('html'), null);
  }

  ngOnInit(): void {
    this.accountService.identity().subscribe();

    this.accountService.getAuthenticationState().subscribe(account => {
      this.account = account;
    });

    const saved = localStorage.getItem('oc-sidebar-collapsed');
    const savedLang = localStorage.getItem('oc-lang') ?? 'fr';
    const validLangs = ['fr', 'en', 'ar-ly'];
    const lang = validLangs.includes(savedLang) ? savedLang : 'fr';
    this.currentLang = lang;
    this.translateService.use(lang);
    if (saved !== null) {
      this.sidebarCollapsed = saved === 'true';
    }

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateTitle();
        this.openSectionForUrl(event.urlAfterRedirects);
      }
    });

    this.translateService.onLangChange.subscribe((langChangeEvent: LangChangeEvent) => {
      this.updateTitle();
      dayjs.locale(langChangeEvent.lang);
      this.renderer.setAttribute(document.querySelector('html'), 'lang', langChangeEvent.lang);
      this.updatePageDirection();
    });
  }

  changeLanguage(lang: string): void {
    this.currentLang = lang;
    this.translateService.use(lang);
    localStorage.setItem('oc-lang', lang);
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    localStorage.setItem('oc-sidebar-collapsed', String(this.sidebarCollapsed));
  }

  toggleSection(key: string): void {
    this.openSections[key] = !this.openSections[key];
  }

  // En mode réduit (icônes seules), tous les liens restent accessibles
  isSectionOpen(key: string): boolean {
    return this.sidebarCollapsed || this.openSections[key];
  }

  logout(): void {
    this.loginService.logout();
    this.router.navigate(['']);
  }

  private openSectionForUrl(url: string): void {
    const path = url.split('?')[0];
    const match = this.sectionRoutes.find(s => s.prefixes.some(p => path === p || path.startsWith(p + '/')));
    if (match) {
      this.openSections[match.key] = true;
    }
  }

  private getPageTitle(routeSnapshot: ActivatedRouteSnapshot): string {
    const title: string = routeSnapshot.data['pageTitle'] ?? '';
    if (routeSnapshot.firstChild) {
      return this.getPageTitle(routeSnapshot.firstChild) || title;
    }
    return title;
  }

  private updateTitle(): void {
    let pageTitle = this.getPageTitle(this.router.routerState.snapshot.root);
    if (!pageTitle) {
      pageTitle = 'global.title';
    }
    this.translateService.get(pageTitle).subscribe(title => this.titleService.setTitle(title));
  }

  private updatePageDirection(): void {
    this.renderer.setAttribute(
      document.querySelector('html'),
      'dir',
      this.findLanguageFromKeyPipe.isRTL(this.translateService.currentLang) ? 'rtl' : 'ltr'
    );
  }
}
