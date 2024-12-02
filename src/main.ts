import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { HttpClientModule, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations'
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAnalytics, provideAnalytics, ScreenTrackingService } from '@angular/fire/analytics';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { getFunctions, provideFunctions } from '@angular/fire/functions';
import { getStorage, provideStorage } from '@angular/fire/storage';

import { RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module } from "ng-recaptcha";

import { pageTransition } from './app/animations/nav-animation';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular({ navAnimation: pageTransition }),
    provideRouter(routes), 
    provideAnimations(),

    importProvidersFrom(provideFirebaseApp(() => initializeApp({
      projectId: "ionicwebpage",
      appId: "1:952994598736:web:c051e724ce521f59cca655",
      databaseURL: "https://ionicwebpage.firebaseio.com",
      storageBucket: "ionicwebpage.appspot.com",
      apiKey: "AIzaSyBytj8gvFINALswEUnSwtUBBRoDfUuQDJw",
      authDomain: "ionicwebpage.firebaseapp.com",
      messagingSenderId: "952994598736"
    })), 

    provideAnalytics(() => getAnalytics()), 
    ScreenTrackingService, 
    provideDatabase(() => getDatabase()), 
    provideFunctions(() => getFunctions()), 
    provideStorage(() => getStorage())),

    importProvidersFrom(RecaptchaV3Module, HttpClientModule), 
    // provideHttpClient(withInterceptorsFromDi()),
    
    { provide: RECAPTCHA_V3_SITE_KEY, useValue: environment.recaptcha.siteKey },
    
  ]
});
