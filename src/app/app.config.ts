import { ApplicationConfig, provideBrowserGlobalErrorListeners, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { 
  LucideAngularModule,
  LayoutDashboard, 
  Network, 
  FileText, 
  Calendar, 
  Users, 
  Briefcase, 
  Search, 
  Bell, 
  Mail, 
  Download, 
  Plus, 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  ListTodo, 
  CircleDollarSign, 
  LogOut, 
  LineChart,
  Building2,
  RefreshCw,
  Star,
  Edit3,
  UserX,
  ArrowLeft,
  Save,
  Trash2,
  Eye
} from 'lucide-angular';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(), 
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom(
      LucideAngularModule.pick({ 
        LayoutDashboard, 
        Network, 
        FileText, 
        Calendar, 
        Users, 
        Briefcase, 
        Search, 
        Bell, 
        Mail, 
        Download, 
        Plus, 
        ClipboardList, 
        Clock, 
        CheckCircle2, 
        ListTodo, 
        CircleDollarSign, 
        LogOut, 
        LineChart,
        Building2,
        RefreshCw,
        Star,
        Edit3,
        UserX,
        ArrowLeft,
        Save,
        Trash2,
        Eye
      })
    )
  ],
};
