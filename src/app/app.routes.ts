import {Routes} from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'upload',
    pathMatch: 'full'
  },
  {
    path: 'upload',
    loadComponent: () => import('./pages/upload/upload')
      .then(m => m.Upload)
  },
  {
    path: 'history',
    loadComponent: () => import('./pages/history/history')
      .then(m => m.History)
  },
  {
    path: '**',
    redirectTo: 'upload'
  }
];
