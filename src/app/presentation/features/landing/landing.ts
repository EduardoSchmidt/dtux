import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { PoButtonModule } from '@po-ui/ng-components';

/**
 * Tela inicial "em branco": nenhum po-page-default, nenhum breadcrumb — só um botão central.
 * Ao clicar, navega para `/portal`, que é a tela principal (busca) que já existia.
 */
@Component({
  selector: 'app-landing',
  imports: [PoButtonModule],
  templateUrl: './landing.html',
  styleUrl: './landing.scss'
})
export class Landing {
  private readonly router = inject(Router);

  enter(): void {
    this.router.navigate(['/portal']);
  }
}
