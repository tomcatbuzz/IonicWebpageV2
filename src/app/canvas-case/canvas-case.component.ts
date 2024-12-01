import { Component, ElementRef, HostListener, OnInit, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import * as THREE from 'three';
import gsap from 'gsap';

@Component({
  selector: 'app-canvas-case',
  templateUrl: './canvas-case.component.html',
  styleUrls: ['./canvas-case.component.scss'],
  standalone: true,
})
export class CanvasCaseComponent implements AfterViewInit, OnDestroy {
@ViewChild('rendererContainer', { static: true }) rendererContainer!: ElementRef<HTMLCanvasElement>;
private renderer!: THREE.WebGLRenderer;
private scene!: THREE.Scene;
private camera!: THREE.PerspectiveCamera;
private cubes: THREE.Mesh[] = [];
private clock = new THREE.Clock();
private mouse = new THREE.Vector2();
private basePositions: THREE.Vector3[] = [];
// private hoverStrength = 0;
// private hoverPosition = new THREE.Vector3();
// private hoverTimeout: any;
// private target!: THREE.WebGLRenderTarget;
// private target1!: THREE.WebGLRenderTarget;
// private model!: any;

// private renderLoop: number | null = null;
// private activatedRoute = inject(ActivatedRoute);  

constructor() {
  // this.renderScene = this.renderScene.bind(this);
}

ngAfterViewInit() {
  setTimeout(() => {
    this.init();
    this.animate();
  }, 500)
  
  // this.onWindowResize()
}
  
init() {
  this.scene = new THREE.Scene();
  this.scene.background = new THREE.Color('skyblue');

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
  console.log('this is running', this.renderer)
  
  this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);
  this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  this.renderer.setSize(window.innerWidth, window.innerHeight);
  console.log(window.innerWidth, "anything here")
  this.renderer.shadowMap.enabled = true;
  this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Could use @HostListener???
  this.renderer.domElement.addEventListener('mousemove', this.onMouseMove.bind(this));
  // window.addEventListener('mousemove', this.onMouseMove.bind(this));

  // Delay the call to onWindowResize to ensure rendererContainer is initialized
  setTimeout(() => this.onWindowResize(), 0);
}

createCubes() {
  const vertexShader = `
    uniform float time;
    uniform vec3 mousePosition;
    uniform float mouseStrength;
    varying vec3 vPosition;
    varying float vDistanceToMouse;

    void main() {
      vPosition = position;
      vec3 transformed = position;
      
      // Base Pulse effect with sine wave ORIGINAL movement
      transformed.z += sin(time + position.x * 5.0) * 0.2;

      // Calculate distance to mouse point
      float distanceToMouse = distance(mousePosition, transformed);
      vDistanceToMouse = distanceToMouse;

      // Mouse effect
      float mouseEffect = smoothstep(1.0, 0.0, distanceToMouse / 3.0);
      transformed.z += mouseEffect * mouseStrength * 0.5;

      // vPosition = transformed
      gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float mouseStrength;
    varying vec3 vPosition;
    varying float vDistanceToMouse;
    
    void main() {
      vec3 baseColor = vec3(0.5, 0.7, 0.9);
      float colorIntensity = 1.0 + (mouseStrength * 0.3);

      vec3 finalColor = baseColor * colorIntensity;
      gl_FragColor = vec4(finalColor, 1.0);
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
      mousePosition: { value: new THREE.Vector3() },
      mouseStrength: { value: 0 }
    }
  });

  // My Original cube loop
  // for (let x = 0; x < gridSize; x++) {
  //   for (let y = 0; y < gridSize; y++) {
  //     for (let z = 0; z < gridSize; z++) {
  //       const geometry = new THREE.BoxGeometry(size, size, size);
  //       // const material = new THREE.MeshNormalMaterial(); // Placeholder material, will replace with ShaderMaterial
  //       const cube = new THREE.Mesh(geometry, material);
  //       cube.scale.set(window.innerWidth / window.innerHeight, 1, 1);
  //       cube.position.set(
  //         x * (size + gap) - (gridSize / 2) * (size + gap),
  //         y * (size + gap) - (gridSize / 2) * (size + gap),
  //         z * (size + gap) - (gridSize / 2) * (size + gap)
  //       );

  //       // cube.scale.set(0.5, 0.5, 0.5)
  //       this.scene.add(cube);
  //       this.cubes.push(cube);
  //     }
  //   }
  // }
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      for (let z = 0; z < gridSize; z++) {
        const geometry = new THREE.BoxGeometry(size, size, size);
        const cube = new THREE.Mesh(geometry, material.clone());
        
        const posX = x * (size + gap) - (gridSize / 2) * (size + gap);
        const posY = y * (size + gap) - (gridSize / 2) * (size + gap);
        const posZ = z * (size + gap) - (gridSize / 2) * (size + gap);
        
        cube.position.set(posX, posY, posZ);
        
        // Store base positions for reset
        this.basePositions.push(cube.position.clone());

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

  // Error on [index] possibly with forEach usage
  // this.cubes.forEach(cube => {
  //   const material = cube.material as THREE.ShaderMaterial;
  //   material.uniforms['time'].value = time;

  //   cube.position.z = this.basePositions[index].z + Math.sin(time * 2 + cube.position.x * 5) * 0.1;

  for (let i = 0; i < this.cubes.length; i++) {
    const cube = this.cubes[i];
    const material = cube.material as THREE.ShaderMaterial;
    material.uniforms['time'].value = time;
    
    // Use the base position to calculate wave
    const newPosition = this.basePositions[i].clone();
    newPosition.z += Math.sin(time * 2 + newPosition.x * 5) * 0.1;
    cube.position.copy(newPosition);
  }

    // original code might not have been working
    // if (material.uniforms['time']) {
    //   material.uniforms['time'].value = time;
    //   material.uniforms['hoverPosition'].value.copy(this.hoverPosition);
    //   material.uniforms['hoverStrength'].value = this.hoverStrength;
    // }
  // });
  // this.cubes.forEach(cube => {
  //   cube.rotation.x += 0.01;
  //   cube.rotation.y += 0.01;
  // })
  this.renderer.render(this.scene, this.camera);
}

onMouseMove(event: MouseEvent) {
  // const mouse = new THREE.Vector2();
  this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(this.mouse, this.camera);
  const intersects = raycaster.intersectObjects(this.cubes);
  // console.log(intersects, "mouse over")

  // Reset interaction
  this.cubes.forEach((cube, index) => {
    const material = cube.material as THREE.ShaderMaterial;
    material.uniforms['mouseStrength'].value = 0;

    gsap.to(cube.position, {
      z: this.basePositions[index].z, 
      duration: 0.5,
      ease: 'power2.out'
    })
  });

  if (intersects.length > 0) {
    intersects.forEach(intersect => {
      const cube = intersect.object as THREE.Mesh;
      const material = cube.material as THREE.ShaderMaterial;

      // map mouse positions
      const mouseWorldPosition = new THREE.Vector3(
        this.mouse.x * 5,
        this.mouse.y * 5,
        0
      );
      // console.log(mouse, 'MOUSE')
      material.uniforms['mousePosition'].value.copy(mouseWorldPosition);

      gsap.to(material.uniforms['mouseStrength'], {
        value: 1,
        duration: 0.3,
        ease: 'power2.out'
      });

      gsap.to(cube.position, {
        z: cube.position.z + 0.1,
        duration: 0.3,
        ease: 'power2.out'
      })
    });
  }

  // ORIGINAL code may not be working
  // if (intersects.length > 0) {
  //   const intersectedCube = intersects[0].object;
  //   this.hoverPosition.copy(intersectedCube.position);

  //   // Animate hoverStrength using gsap
  //   this.cubes.forEach(cube => {
  //     const material = cube.material as THREE.ShaderMaterial;
  //     gsap.to(material.uniforms['hoverStrength'], {
  //       value: 1.5,
  //       duration: 0.3,
  //       onComplete: () => {
  //         gsap.to(material.uniforms['hoverStrength'], {
  //           value: 0,
  //           duration: 0.3
  //         });
  //       // console.log(material.uniforms['hoverStrength'], "what is here")
  //       }
  //     });
  //   });
  // }
}

ngOnDestroy() {
  this.renderer.dispose();
  this.scene.clear();
  this.renderer.domElement.removeEventListener('mousemove', this.onMouseMove.bind(this));
  // clearTimeout(this.hoverTimeout);
}

@HostListener('window:resize')
onWindowResize() {
  const width = this.rendererContainer.nativeElement.clientWidth || window.innerWidth;
  const height = this.rendererContainer.nativeElement.clientHeight || window.innerHeight;
  console.log(width, "width")
  this.camera.aspect = width / height;
  this.camera.updateProjectionMatrix();
  this.renderer.setSize(width, height, false);
}
}
