import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
// import { ActivatedRoute } from '@angular/router';
import { IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonContent } from '@ionic/angular/standalone';

import { HeaderComponent } from '../header/header.component';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FooterComponent } from '../footer/footer.component';
import { ShuffleComponent } from '../shuffle/shuffle.component';
import { gsap } from 'gsap';
import { cube } from 'ionicons/icons';
// import model from '../../assets/facefull.glb'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonContent, HeaderComponent, FooterComponent, ShuffleComponent],
})
export class HomeComponent  implements OnInit, OnDestroy {
  @ViewChild('rendererContainer', { static: true }) rendererContainer!: ElementRef<HTMLDivElement>;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private cubes: THREE.Mesh[] = [];
  private clock = new THREE.Clock();
  private hoverStrength = 0;
  private hoverPosition = new THREE.Vector3();
  // private hoverTimeout: any;
  // private target!: THREE.WebGLRenderTarget;
  // private target1!: THREE.WebGLRenderTarget;
  // private model!: any;

  // private renderLoop: number | null = null;
  // private activatedRoute = inject(ActivatedRoute);  

  constructor() {
    // this.renderScene = this.renderScene.bind(this);
  }

  ngOnInit() {
    this.init();
    this.animate();
    // this.onWindowResize()
  }
    
  init() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 10);
    // this.camera.position.set(0, -0.5, 1);
    // this.camera.position.z = 2;
    this.camera.position.set(0, 0, 10)

    this.createCubes();
    
    // original scene
    // this.geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    // this.material = new THREE.MeshNormalMaterial();
    // this.mesh = new THREE.Mesh(this.geometry, this.material);
    // console.log(this.mesh, 'mesh')
    // this.scene.add(this.mesh);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    // console.log('this is running', this.renderer)
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    console.log(window.innerWidth, "anything here")
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Could use @HostListener???
    this.renderer.domElement.addEventListener('mousemove', this.onMouseMove.bind(this));

    // Delay the call to onWindowResize to ensure rendererContainer is initialized
    setTimeout(() => this.onWindowResize(), 0);
  }

  createCubes() {
    const vertexShader = `
      uniform float time;
      uniform vec3 hoverPosition;
      uniform float hoverStrength;
      varying vec3 vPosition;

      void main() {
        vPosition = position;
        vec3 transformed = position;
        
        // Pulse effect with sine wave
        transformed.z += sin(time + position.x * 5.0) * 0.2;

        // Hover effect
        float distanceToHover = distance(hoverPosition, position);
        transformed += normalize(position - hoverPosition) * hoverStrength * exp(-distanceToHover * 5.0);
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
      }
    `;

    const fragmentShader = `
      varying vec3 vPosition;
      
      void main() {
        gl_FragColor = vec4(vPosition * 0.5 + 0.5, 1.0);
      }
    `;

    const gridSize = Math.cbrt(512); // Create a grid of 512 cubes (8x8x8)
    const size = 1; // Size of each small cube
    const gap = 0.1; // Gap between cubes

    // Shader Material
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        time: { value: 0 },
        hoverPosition: { value: new THREE.Vector3() },
        hoverStrength: { value: 0 }
      }
    });

    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        for (let z = 0; z < gridSize; z++) {
          const geometry = new THREE.BoxGeometry(size, size, size);
          // const material = new THREE.MeshNormalMaterial(); // Placeholder material, will replace with ShaderMaterial
          const cube = new THREE.Mesh(geometry, material);
          cube.position.set(
            x * (size + gap) - (gridSize / 2) * (size + gap),
            y * (size + gap) - (gridSize / 2) * (size + gap),
            z * (size + gap) - (gridSize / 2) * (size + gap)
          );

          // cube.scale.set(0.5, 0.5, 0.5)
          this.scene.add(cube);
          this.cubes.push(cube);
        }
      }
    }
  }

  // private loadModel() {
  //   const loader = new GLTFLoader()
  //   this.model = '../../assets/facefull.glb';
  //   loader.load(this.model, (gltf) => {
  //     this.model = gltf.scene.children[0];
  //     console.log(this.model, 'model running?')
  //     this.model.traverse((o: THREE.Object3D) => {
  //       if (this.isMesh(o)) {
  //         console.log(o);
  //         o.material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  //       }
  //     });

  //     this.setupModel();
  //     // this.startRenderLoop();
  //   })
  // }

  // private isMesh(obj: THREE.Object3D): obj is THREE.Mesh {
  //   return obj instanceof THREE.Mesh;
  // }

  // private setupModel() {
  //   this.model.position.set(0, -1, -1.5);
  //   this.model.rotation.set(0, 0, 0);
  //   this.model.scale.set(4000,2000,2000);

  //   this.scene.add(this.model);
  // }

  animate() {
    requestAnimationFrame(() => this.animate());
    // this.mesh.rotation.x += 0.001;
    // this.mesh.rotation.y += 0.002;
    const time = this.clock.getElapsedTime();
    this.cubes.forEach(cube => {
      const material = cube.material as THREE.ShaderMaterial;
      if (material.uniforms['time']) {
        material.uniforms['time'].value = time;
        material.uniforms['hoverPosition'].value.copy(this.hoverPosition);
        material.uniforms['hoverStrength'].value = this.hoverStrength;
      }
    });
    // this.cubes.forEach(cube => {
    //   cube.rotation.x += 0.01;
    //   cube.rotation.y += 0.01;
    // })
    this.renderer.render(this.scene, this.camera);
  }

  onMouseMove(event: MouseEvent) {
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);

    const intersects = raycaster.intersectObjects(this.cubes);
    // console.log(intersects, "mouse over ")
    if (intersects.length > 0) {
      const intersectedCube = intersects[0].object;
      this.hoverPosition.copy(intersectedCube.position);

      // Animate hoverStrength using gsap
      this.cubes.forEach(cube => {
        const material = cube.material as THREE.ShaderMaterial;
        gsap.to(material.uniforms['hoverStrength'], {
          value: 1.5,
          duration: 0.3,
          onComplete: () => {
            gsap.to(material.uniforms['hoverStrength'], {
              value: 0,
              duration: 0.3
            });
          // console.log(material.uniforms['hoverStrength'], "what is here")

          }
          
        });
      });
      
    }
  }

  ngOnDestroy() {
    this.renderer.dispose();
    this.scene.clear();
    // clearTimeout(this.hoverTimeout);
  }

  @HostListener('window:resize')
  onWindowResize() {
    // console.log('this function is working')
    // const width = this.rendererContainer.nativeElement.offsetWidth;
    // const height = this.rendererContainer.nativeElement.offsetHeight;
    // original below
    const width = this.rendererContainer.nativeElement.clientWidth || window.innerWidth;
    const height = this.rendererContainer.nativeElement.clientHeight || window.innerHeight;
    // const rect = this.rendererContainer.nativeElement.getBoundingClientRect();
    // console.log(rect, 'what is the rect????')
    // const width = rect.width;
    // const height = rect.height;
    console.log(width, "width")
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
    // attempt at resize cube(mesh) not working
    // const scale = Math.min(width, height) / 500;
    // this.cubes.forEach(cube => {
    //   cube.scale.set(scale, scale, scale);
    // })

    // Update the mesh scale
    // const aspectRatio = width / height;
    
    // const scale = Math.min(width, height) / 500
    // this.mesh.scale.set(scale, scale, scale);
    // console.log(scale, 'scale')
  }
}

