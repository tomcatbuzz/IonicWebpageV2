import { AfterViewChecked, AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
// import { ActivatedRoute } from '@angular/router';
import { IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonContent } from '@ionic/angular/standalone';

import { HeaderComponent } from '../header/header.component';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// import model from '../../assets/facefull.glb'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonContent, HeaderComponent],
})
export class HomeComponent  implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('rendererContainer', { static: true }) rendererContainer!: ElementRef<HTMLDivElement>;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private cube!: THREE.Mesh;
  // private geometry!: THREE.BufferGeometry;
  // private material!: THREE.ShaderMaterial;
  // private mesh!: THREE.Mesh;
  private rendererInitialized = false;
  // public home!: string;
  // private activatedRoute = inject(ActivatedRoute);
  private model: any;

  constructor() {
    // this.render = this.render.bind(this);
  }

  ngOnInit() {
    const loader = new GLTFLoader()
    this.model = '../../assets/facefull.glb'
    // this.home = this.activatedRoute.snapshot.paramMap.get('id') as string;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 5;
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    // const geometry = new THREE.BoxGeometry();
    const geometry = new THREE.PlaneGeometry(1, 1, 1, 1);
    // const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
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
    const material = new THREE.ShaderMaterial({ 
      // extensions: {
      //   derivatives: "#extension GL_OES_standard_derivatives : enable"
      // },
      side: THREE.DoubleSide,
      uniforms: {
        time: { value: 0 },
        resolution: { value: new THREE.Vector4() },
      },
      // wireframe: true,
      // transparent: true,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader
    });
    this.cube = new THREE.Mesh(geometry, material);
    // this.scene.add(this.cube);
    console.log(this.cube, 'cube')
    console.log('this is running', this.renderer)

    // this.loader = new GLTFLoader()
    loader.load(this.model,(gltf)=>{
      this.model = gltf.scene.children[0];
      this.model.position.set(0, -1, -1.5);
      this.model.rotation.set(0, 0, 0);
      this.model.scale.set(4000,2000,2000);
      console.log(this.model.scale);
      this.scene.add(this.model);
      this.model.traverse((o: { isMesh: any; material: THREE.MeshBasicMaterial; })=>{
        if(o.isMesh){
          console.log(o);
          // original color for threejs depth texture
          // o.material = new THREE.MeshBasicMaterial({color:0x000000})
          o.material = new THREE.MeshBasicMaterial({color:0xff0000})
          
        }
      });
      console.log(this.model, 'model running?')
    });
  }

  ngAfterViewChecked() { 
    if(!this.rendererInitialized && this.rendererContainer) {
      // const scene = document.getElementById('rendererContainer')
      // scene?.appendChild(this.renderer.domElement)
      this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.render();
      this.rendererInitialized = true
      console.log(this.renderer.domElement, 'what is here')
    }
    

    // if(!this.rendererInitialized && this.rendererContainer) {
    //   this.initRenderer();
    //   this.render();
    //   this.rendererInitialized = true;
    //   console.log('this container', this.rendererContainer)
    // } else {
    //   console.log('Shit aint running')
    // }
  }

  private render = () => {
    requestAnimationFrame(this.render);
    this.cube.rotation.x += 0.01;
    this.cube.rotation.y += 0.01;
    this.renderer.render(this.scene, this.camera)
  }

  ngOnDestroy() {
    this.renderer.dispose();
    this.scene.remove(this.cube);
  }

  // private initMaterial() {
  //   const vertexShader = `
  //   varying vec2 vUv;
    
  //   void main() {
  //     vUv = uv;
  //     gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  //   }
  // `;
  //   const fragmentShader = `
  //   varying vec2 vUv;
  //   void main() {
  //     gl_FragColor = vec4(vUv,0.0,1.);
  //   }
  // `;
  //   this.material = new THREE.ShaderMaterial({
  //     vertexShader,
  //     fragmentShader
  //   });
  // }



  @HostListener('window:resize')
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

}
