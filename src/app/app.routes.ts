import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'browse',
    pathMatch: 'full'
  },
  {
    path: 'browse',
    loadComponent: () =>
      import('./features/browse/browse.component').then(m => m.BrowseComponent)
  },
  {
    path: 'card/:id',
    loadComponent: () =>
      import('./features/card-detail/card-detail.component').then(m => m.CardDetailComponent)
  },
  {
    path: 'collection',
    loadComponent: () =>
      import('./features/collection/collection.component').then(m => m.CollectionComponent)
  },
  {
    path: '**',
    redirectTo: 'browse'
  }
];
