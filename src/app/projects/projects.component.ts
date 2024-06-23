import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

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
  @ViewChild('rendererContainer', { static: true }) rendererContainer!: ElementRef<HTMLDivElement>;
  scene: any;
  camera: any;
  renderer: any;
  cube: any;
  geometry: any;
  material: any;
  mesh: any;

  constructor() { }

  ngOnInit() {
    this.init();
    this.animate();
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  init() {
    this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 10 );
    this.camera.position.z = 2;

    this.scene = new THREE.Scene();

    this.geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
    this.material = new THREE.MeshNormalMaterial();

    this.mesh = new THREE.Mesh( this.geometry, this.material );
    this.scene.add( this.mesh );

    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer.setSize( window.innerWidth, window.innerHeight );

    // const scene = document.getElementById('canvas');

    // // document.body.appendChild( this.renderer.domElement );
    // scene.appendChild( this.renderer.domElement );
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);
  }

  animate() {
      requestAnimationFrame(() => this.animate());
      this.mesh.rotation.x += 0.001;
      this.mesh.rotation.y += 0.002;
      // this moves it animated-- need to position scene somewhere
      // this.mesh.position.x += 0.001;
      // this.mesh.position.y += 0.002;  
      this.renderer.render( this.scene, this.camera );      
  }

}
