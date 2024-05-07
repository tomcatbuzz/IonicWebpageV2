import { Component, OnInit } from '@angular/core';

import { IonHeader, IonToolbar, IonButtons, IonButton, IonMenuButton, IonTitle, IonContent } from '@ionic/angular/standalone';

import { HeaderComponent } from '../header/header.component';
import * as THREE from 'three';


@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonButtons, IonButton, IonMenuButton, IonTitle, IonContent, HeaderComponent],
})
export class ProjectsComponent  implements OnInit {

  constructor() { }

  ngOnInit() {
    console.log('projects');
  }

}
