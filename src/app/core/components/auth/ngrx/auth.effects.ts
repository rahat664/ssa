// src/app/store/effects/auth.effects.ts
import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {of} from 'rxjs';
import {catchError, map, mergeMap, tap} from 'rxjs/operators';
import {Router} from '@angular/router';
import {
  login,
  loginFailure,
  loginSuccess,
  loginUsingPhoneNumber,
  logout,
} from './auth.action';
import {AuthService} from '../services/auth.service';
import {SharedService} from '../../../../shared/service/shared.service';

@Injectable()
export class AuthEffects {
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(login),
      mergeMap(action =>
        this.authService.login(action.payload).pipe(
          map(response => {
            // @ts-ignore
            if (response.status === 'OK') {
              return loginSuccess({response});
            } else {
              return loginFailure({error: response.message});
            }
          }),
          catchError(error => of(loginFailure({error})))
        )
      )
    )
  );

  loginUsingPhoneNumber$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loginUsingPhoneNumber),
      mergeMap(action =>
        this.authService.verifyOtp(action.payload).pipe(
          map(response => {
            // @ts-ignore
            if (response.status === 'OK') {
              return loginSuccess({response});
            } else {
              return loginFailure({error: response.message});
            }
          }),
          catchError(error => of(loginFailure({error})))
        )
      )
    )
  );

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(loginSuccess),
        tap(({response}) => {
          const isGsoRoles = response?.data?.roles?.includes('ROLE_GSO')
          if (isGsoRoles) {
          } else {
            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('email', response.data.email);
            localStorage.setItem('name', response.data.name);
            localStorage.setItem('image', response.data.image || '');
            localStorage.setItem('role', JSON.stringify(response.data.roles));
            localStorage.setItem('userPhoneNumber', response.data.phone);
            response.data.customer ? localStorage.setItem('selectedCustomerCode', response.data.customer.customerCode) : localStorage.removeItem('selectedCustomerCode');
            // Change to your desired route
            this.shared.getUserPermissions().subscribe((permissions: any) => {
              if (permissions.status == 'OK') {
                localStorage.setItem(
                  'permissions',
                  JSON.stringify(permissions.data)
                );
                this.router.navigateByUrl('/sass').then(r => {
                });

              } else {
              }
            });
          }
        })
      ),
    {dispatch: false}
  );

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(logout),
        tap(() => {
          localStorage.clear();
        })
      ),
    {dispatch: false}
  );

  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private router: Router,
    private shared: SharedService
  ) {
  }

  isAdmin() {
    const role = localStorage.getItem('role');
    if (role) {
      return role.includes('ROLE_SUPERADMIN');
    } else {
      return false;
    }
  }
}
