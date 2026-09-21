import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { PoButtonModule, PoFieldModule, PoPageModule } from '@po-ui/ng-components';
import { BreadcrumbControlService } from 'dts-backoffice-util';

@Component({
  selector: 'app-home',
  imports: [FormsModule, PoPageModule, PoFieldModule, PoButtonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  /** BreadcrumbControlService vem da lib dts-backoffice-util. */
  protected readonly breadcrumbControl = inject(BreadcrumbControlService);

  protected readonly searchTerm = signal('');

  ngOnInit(): void {
    this.breadcrumbControl.newBreadcrumb();
    this.breadcrumbControl.addBreadcrumb('Início', this.activatedRoute);
  }

  onSearch(): void {
    const term = this.searchTerm().trim();

    if (!term) {
      return;
    }

    // Ao buscar qualquer coisa, a aplicação navega para a tela de resultados.
    this.router.navigate(['/busca', term]);
  }
}
