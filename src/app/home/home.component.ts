import { AfterViewChecked, AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild, inject } from '@angular/core';
// import { ActivatedRoute } from '@angular/router';
import { IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonContent } from '@ionic/angular/standalone';

import { HeaderComponent } from '../header/header.component';
import * as THREE from 'three'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonContent, HeaderComponent],
})
export class HomeComponent  implements OnInit, AfterViewInit {
  @ViewChild('rendererContainer', { static: true }) rendererContainer!: ElementRef<HTMLDivElement>;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private geometry!: THREE.BufferGeometry;
  private material!: THREE.ShaderMaterial;
  private mesh!: THREE.Mesh;
  private rendererInitialized = false;
  // public home!: string;
  // private activatedRoute = inject(ActivatedRoute);

  constructor() {
    // this.render = this.render.bind(this);
  }

  ngOnInit() {
    // this.home = this.activatedRoute.snapshot.paramMap.get('id') as string;
    this.initScene();
    this.initCamera();
    this.initGeometry();
    this.initMaterial();
    this.initMesh();
    // this.initRenderer();
    // this.render();
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    console.log('this is running', this.renderer)
  }

  ngAfterViewInit() {
    if(!this.rendererInitialized && this.rendererContainer) {
      this.initRenderer();
      this.render();
      this.rendererInitialized = true;
      console.log('this container', this.rendererContainer)
    } else {
      console.log('Shit aint running')
    }
    
  }

  private initScene() {
    this.scene = new THREE.Scene()
  }

  private initCamera() {
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 5;
  }

  private initGeometry() {
    this.geometry = new THREE.PlaneGeometry(1, 1, 1, 1);
    // const vertices = new Float32Array( [
    //   -1.0, -1.0,  1.0, // v0
    //    1.0, -1.0,  1.0, // v1
    //    1.0,  1.0,  1.0, // v2
    // ])
  }

  private initMaterial() {
    const vertexShader = `
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;
    const fragmentShader = `
    varying vec2 vUv;
    void main() {
      gl_FragColor = vec4(vUv,0.0,1.);
    }
  `;
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader
    });
  }

  private initMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
  }

  private initRenderer() {
    // this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);
  }

  private render() {
    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
  }

  @HostListener('window:resize')
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

}
