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

  private renderer: Renderer2;

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
    if (saved !== null) {
      this.sidebarCollapsed = saved === 'true';
    }

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateTitle();
      }
    });

    this.translateService.onLangChange.subscribe((langChangeEvent: LangChangeEvent) => {
      this.updateTitle();
      dayjs.locale(langChangeEvent.lang);
      this.renderer.setAttribute(document.querySelector('html'), 'lang', langChangeEvent.lang);
      this.updatePageDirection();
    });
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    localStorage.setItem('oc-sidebar-collapsed', String(this.sidebarCollapsed));
  }

  logout(): void {
    this.loginService.logout();
    this.router.navigate(['']);
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
