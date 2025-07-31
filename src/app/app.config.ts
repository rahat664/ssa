import {ApplicationConfig, provideZoneChangeDetection, isDevMode} from '@angular/core';
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

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({eventCoalescing: true}), provideRouter(routes, withPreloading(PreloadAllModules)),
    provideStore({auth:authReducer}, {metaReducers}),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideEffects([AuthEffects]),
    provideStoreDevtools({
    maxAge: 25,
    logOnly: !isDevMode()
  }), provideRouterStore()]
};
