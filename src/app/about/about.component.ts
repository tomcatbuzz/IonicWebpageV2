import { Component, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonButtons, IonButton, IonMenuButton, IonTitle, IonContent } from '@ionic/angular/standalone';

import { HeaderComponent } from '../header/header.component';
import * as THREE from 'three';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonButtons, IonButton, IonMenuButton, IonTitle, IonContent, HeaderComponent, FooterComponent],
})
export class AboutComponent  implements OnInit {

  constructor() { }

  ngOnInit() {
    console.log('about');
  }
  container: any; // any  = ugly

  stuff() {
    this.container = document.getElementById('canvas'); // should actually be done using ViewChild

    function animate() {
      requestAnimationFrame(animate);
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
    }

    // var scene = new THREE.Scene();
    console.log('HELLO');

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    // document.body.appendChild(renderer.domElement);
    this.container.appendChild(renderer.domElement);

    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    camera.position.z = 5;

    animate();
  }

}
