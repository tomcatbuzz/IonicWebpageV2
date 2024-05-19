import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IonApp, IonMenu, IonContent, IonList, IonListHeader, IonNote, IonMenuToggle, IonItem, IonIcon, IonLabel, IonRouterOutlet } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { mailOutline, mailSharp, paperPlaneOutline, paperPlaneSharp, heartOutline, heartSharp, archiveOutline, archiveSharp, trashOutline, trashSharp, warningOutline, warningSharp, bookmarkOutline, bookmarkSharp } from 'ionicons/icons';
import { LoadingComponent } from './loading/loading.component';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, IonApp, IonMenu, IonContent, IonList, IonListHeader, IonNote, IonMenuToggle, IonItem, IonIcon, IonLabel, IonRouterOutlet, LoadingComponent],
})
export class AppComponent {
  // loading = true; 
  // private router = inject(Router);
  public appPages = [
    { title:'Home', url: '/home', icon: 'mail' },
    { title: 'About', url: '/about', icon: 'mail' },
    { title: 'Projects', url: '/projects', icon: 'mail' },
    { title: 'Contact', url: '/contact', icon: 'mail' }
  ]

  constructor() {
    addIcons({ mailOutline, mailSharp, paperPlaneOutline, paperPlaneSharp, heartOutline, heartSharp, archiveOutline, archiveSharp, trashOutline, trashSharp, warningOutline, warningSharp, bookmarkOutline, bookmarkSharp });

    // this.router.events.subscribe(event => {
    //   if (event instanceof NavigationStart) {
    //     this.loading = true;
    //   } else if (event instanceof NavigationEnd) {
    //     this.loading = false;
    //   }
    // })
  }
}
