import { Routes } from '@angular/router';
import { DetailPage } from './pages/detail/detail.page';
import { CreatePage } from './pages/create/create.page';
import { HomePage } from './home/home.page';

export const routes: Routes = [
  {
    path: 'home',
    component: HomePage,
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'create',
    component: CreatePage,
  },
  {
    path: 'detail',
    component: DetailPage,
  },
  {
    path: 'detail/:id',
    component: DetailPage,
  },
];
