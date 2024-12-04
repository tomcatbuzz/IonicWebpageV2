import { Component } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';

@Component({
    selector: 'app-loading',
    templateUrl: './loading.component.html',
    styleUrls: ['./loading.component.scss'],
    imports: [IonContent],
    standalone: true
})
export class LoadingComponent {

  constructor() { }

  

}
