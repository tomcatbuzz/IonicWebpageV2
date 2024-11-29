import { Component, OnInit } from '@angular/core';
import { IonHeader, IonButtons, IonButton, IonMenuButton, IonIcon, IonLabel, IonToolbar } from "@ionic/angular/standalone";

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  imports: [IonToolbar],
  standalone: true
})
export class FooterComponent  implements OnInit {

  constructor() { }

  ngOnInit() {
    console.log('footer');
  }

}
