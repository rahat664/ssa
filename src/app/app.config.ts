import {ApplicationConfig, provideZoneChangeDetection, isDevMode, importProvidersFrom} from '@angular/core';
import {PreloadAllModules, provideRouter, withPreloading} from '@angular/router';

import {routes} from './app.routes';
import {provideStore} from '@ngrx/store';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {authInterceptor} from './core/components/auth/interceptors/auth.interceptor';
import {provideEffects} from '@ngrx/effects';
import {provideStoreDevtools} from '@ngrx/store-devtools';
import {provideRouterStore} from '@ngrx/router-store';
import {authReducer} from './core/components/auth/ngrx/auth.reducer';
import {metaReducers} from './core/components/auth/ngrx/localstorage.metareducer';
import {AuthEffects} from './core/components/auth/ngrx/auth.effects';
import {provideHotToastConfig} from '@ngneat/hot-toast';
import {CommonModule} from '@angular/common';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({eventCoalescing: true}),
    importProvidersFrom(BrowserAnimationsModule, CommonModule),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideStore({auth: authReducer}, {metaReducers}),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideEffects([AuthEffects]),
    provideHotToastConfig(),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode()
    }), provideRouterStore()]
};
