import { Routes } from '@angular/router';
import { HomePage } from './features/home/pages/home-page/home-page';
import { DashboardPage } from './features/dashboard/pages/dashboard-page/dashboard-page';

export const routes: Routes = [
  { path: '', component: HomePage },
  { path: 'dashboard', component: DashboardPage },
];
