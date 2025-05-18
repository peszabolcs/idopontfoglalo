import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: environment.production,
      registrationStrategy: 'registerWhenStable:30000',
    }),
    provideFirebaseApp(() => {
      try {
        return initializeApp(environment.firebase);
      } catch (error) {
        console.error('Firebase initialization error:', error);
        throw error;
      }
    }),
    provideFirestore(() => {
      try {
        return getFirestore();
      } catch (error) {
        console.error('Firestore initialization error:', error);
        throw error;
      }
    }),
    provideAuth(() => {
      try {
        return getAuth();
      } catch (error) {
        console.error('Firebase Auth initialization error:', error);
        throw error;
      }
    }),
  ],
};
