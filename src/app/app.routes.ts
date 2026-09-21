import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./presentation/features/landing/landing').then(m => m.Landing)
  },
  {
    path: 'portal',
    loadComponent: () => import('./presentation/features/home/home').then(m => m.Home)
  },
  {
    path: 'busca/:termo',
    loadComponent: () =>
      import('./presentation/features/search-results/search-results').then(m => m.SearchResults)
  },
  {
    path: 'item/:id',
    loadComponent: () => import('./presentation/features/item-detail/item-detail').then(m => m.ItemDetail)
  },
  { path: '**', redirectTo: '' }
];
