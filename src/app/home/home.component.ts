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
export class HomeComponent  implements OnInit, OnDestroy {
  @ViewChild('rendererContainer', { static: true }) rendererContainer!: ElementRef<HTMLDivElement>;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private camera1!: THREE.PerspectiveCamera;
  private cube!: THREE.Mesh;
  private plane!: THREE.Mesh;
  private material!: THREE.ShaderMaterial;
  private target!: THREE.WebGLRenderTarget;
  private target1!: THREE.WebGLRenderTarget;

  private rendererInitialized = false;
  private renderLoop: number | null = null;
  // private activatedRoute = inject(ActivatedRoute);
  private model!: any;
  time: 0 = 0;
  modelLoaded: any;

  constructor() {
    this.renderScene = this.renderScene.bind(this);
  }

  ngOnInit() {
    const width = this.rendererContainer.nativeElement.offsetWidth;
    const height = this.rendererContainer.nativeElement.offsetHeight;

    if (width > 0 && height > 0) {
      this.initRenderTargets(width, height);
    } else {
      console.warn('Invalid dimensions for render targets');
    }
    // const loader = new GLTFLoader()
    // this.model = '../../assets/facefull.glb'
    // this.home = this.activatedRoute.snapshot.paramMap.get('id') as string;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1000);
    this.camera1 = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      2.1,
      3
    );
    this.camera.position.set(0, -0.5, 1);
    this.camera1.position.set(0, 0, 2);
    // this.renderer = new THREE.WebGLRenderer({ antialias: true });
    // const geometry = new THREE.BoxGeometry();
    
    // const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const vertexShader = `
    uniform float time;
varying vec2 vUv;
varying vec2 vUv1;
varying vec3 vPosition;
varying float vDepth;
uniform vec2 pixels;
float PI = 3.141592653589793238;

uniform sampler2D depthInfo;
uniform vec4 resolution;
uniform float cameraNear;
uniform float cameraFar;

attribute float y;

// ORIGINAL CODE BELOW
// float readDepth( sampler2D depthSampler, vec2 coord ) {
// 	float fragCoordZ = texture2D( depthSampler, coord ).x;
// 	float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
// 	return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
// }

// GPT SUGGESTED
float perspectiveDepthToViewZ( const in float invClipZ, const in float near, const in float far ) {
  return ( near * far ) / ( ( far - near ) * invClipZ - far );
}

float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
  return ( viewZ + near ) / ( near - far );
}

float readDepth( sampler2D depthSampler, vec2 coord ) {
  float fragCoordZ = texture2D( depthSampler, coord ).x;
  float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
  return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
}

// Simplex 2D noise
//
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
  -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
    dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
//	Simplex 3D Noise 
//	by Ian McEwan, Ashima Arts
//
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float snoise(vec3 v){ 
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

// First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;

// Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  //  x0 = x0 - 0. + 0.0 * C 
  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1. + 3.0 * C.xxx;

// Permutations
  i = mod(i, 289.0 ); 
  vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

// Gradients
// ( N*N points uniformly over a square, mapped onto an octahedron.)
  float n_ = 1.0/7.0; // N=7
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);  //  mod(p,N*N)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

//Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

// Mix final noise value
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                dot(p2,x2), dot(p3,x3) ) );
}
void main() {
  vUv = uv;
  vec2 vUv1 = vec2(vUv.x, y);
  float depth = readDepth( depthInfo, vUv1 );
  
  vec3 pos = position;
  pos.z += (1. - depth)*0.6;
  pos.y += 0.01*snoise(vec3(vUv1*30., time/100.));
  vDepth = depth;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
}
    `;
    const fragmentShader = `
    uniform float time;
    uniform float progress;
    uniform sampler2D depthInfo;
    uniform vec4 resolution;
    varying float vDepth;
    varying vec2 vUv;
    varying vec2 vUv1;
    varying vec3 vPosition;
    uniform float cameraNear;
    uniform float cameraFar;
    float PI = 3.141592653589793238;

    // ORIGINAL CODE BELOW
    // float readDepth( sampler2D depthSampler, vec2 coord ) {
    //   float fragCoordZ = texture2D( depthSampler, coord ).x;
    //   float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
    //   return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
    // }

    // GPT SUGGESTED CODE
    float perspectiveDepthToViewZ( const in float invClipZ, const in float near, const in float far ) {
      return ( near * far ) / ( ( far - near ) * invClipZ - far );
    }
    
    float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
      return ( viewZ + near ) / ( near - far );
    }
    
    float readDepth( sampler2D depthSampler, vec2 coord ) {
      float fragCoordZ = texture2D( depthSampler, coord ).x;
      float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
      return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
    }
    void main()	{
    // gl_FragColor = vec4(vUv,0.0,1.);

    float depth = readDepth( depthInfo, vUv1 );

    float tomix = smoothstep(0.2, 1., vDepth);

    gl_FragColor.rgb = mix(vec3(0.495, 0.165, 0.234),2.*vec3(0.000, 0.001, 0.242),tomix);
    gl_FragColor.a = 1.0;
    }
    `;
    this.material = new THREE.ShaderMaterial({ 
      // extensions: {
      //   derivatives: "#extension GL_OES_standard_derivatives : enable"
      // },
      side: THREE.DoubleSide,
      uniforms: {
        time: { value: 0 },
        depthInfo: { value: 0 },
        progress: { value: 0.6 },
        cameraNear: { value: this.camera1.near },
        cameraFar: { value: this.camera1.far },
        resolution: { value: new THREE.Vector4() },
      },
      // wireframe: true,
      // transparent: true,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader
    });

    const geometry = new THREE.PlaneGeometry(2, 2, 100, 100);
    this.cube = new THREE.Mesh(geometry, this.material);
    // this.scene.add(this.cube);
    console.log(this.cube, 'cube')
    console.log('this is running', this.renderer)

    for (let i = 0; i <= 100; i++) {
      const geometry = new THREE.PlaneGeometry(2, 0.005, 300, 1);

      let y = [];
      let len = geometry.attributes['position'].array.length;
      for (let j = 0; j < len/3; j++) {
        y.push(i/100)
      }
      geometry.setAttribute('y', new THREE.BufferAttribute(new Float32Array(y),1))
      

      
      this.plane = new THREE.Mesh(geometry, this.material);
      this.plane.position.y = (i - 50)/50
      this.scene.add(this.plane);
    }

    // let format = THREE.DepthStencilFormat;
    // const type = THREE.UnsignedShortType;

    // this.target = new THREE.WebGLRenderTarget(width, height);
    // this.target.texture.format = THREE.RGBFormat;
    // this.target.texture.minFilter = THREE.NearestFilter;
    // this.target.texture.magFilter = THREE.NearestFilter;
    // this.target.texture.generateMipmaps = false;
    // // this.target.stencilBuffer = ( format === THREE.DepthStencilFormat ) ? true : false;
    // this.target.stencilBuffer = false;
    //   if (format === THREE.DepthStencilFormat) {
    //     this.target.stencilBuffer = true;
    //   }   
    // this.target.depthBuffer = true;
    // this.target.depthTexture = new THREE.DepthTexture(width, height);
    // this.target.depthTexture.format = format;
    // this.target.depthTexture.type = type;


    // this.target1 = new THREE.WebGLRenderTarget(width, height);
    // this.target1.texture.format = THREE.RGBFormat;
    // this.target1.texture.minFilter = THREE.NearestFilter;
    // this.target1.texture.magFilter = THREE.NearestFilter;
    // this.target1.texture.generateMipmaps = false;
    // // this.target1.stencilBuffer = ( format === THREE.DepthStencilFormat ) ? true : false;
    // this.target.stencilBuffer = false;
    //   if (format === THREE.DepthStencilFormat) {
    //     this.target.stencilBuffer = true;
    //   }
    // this.target1.depthBuffer = true;
    // this.target1.depthTexture = new THREE.DepthTexture(width, height);
    // this.target1.depthTexture.format = format;
    // this.target1.depthTexture.type = type;

    // this.loader = new GLTFLoader()
    // loader.load(this.model,(gltf)=>{
    //   this.model = gltf.scene.children[0];
    //   this.model.position.set(0, -1, -1.5);
    //   this.model.rotation.set(0, 0, 0);
    //   this.model.scale.set(4000,2000,2000);
    //   console.log(this.model.scale);
    //   this.scene.add(this.model);
    //   this.model.traverse((o: { isMesh: any; material: THREE.MeshBasicMaterial; })=>{
    //     if(o.isMesh){
    //       console.log(o);
    //       // original color for threejs depth texture
    //       // o.material = new THREE.MeshBasicMaterial({color:0x000000})
    //       o.material = new THREE.MeshBasicMaterial({color:0xff0000})
          
    //     }
    //   });
    //   console.log(this.model, 'model running?')
    // });

    this.loadModel();
    this.initRenderer();
    this.startRenderLoop();
    this.initRenderTargets(width, height);
  }

  initRenderTargets(width: number, height: number) {
    console.log('initRenderTargets called with width:', width, 'height:', height);
    const format = THREE.DepthStencilFormat;
    const type = THREE.UnsignedShortType;

    this.target = new THREE.WebGLRenderTarget(width, height);
    this.target.texture.format = THREE.RGBFormat;
    this.target.texture.minFilter = THREE.NearestFilter;
    this.target.texture.magFilter = THREE.NearestFilter;
    this.target.texture.generateMipmaps = false;
    // this.target.stencilBuffer = ( format === THREE.DepthStencilFormat ) ? true : false;
    this.target.stencilBuffer = false;
      if (format === THREE.DepthStencilFormat) {
        this.target.stencilBuffer = true;
      }   
    this.target.depthBuffer = true;
    this.target.depthTexture = new THREE.DepthTexture(width, height);
    this.target.depthTexture.format = format;
    this.target.depthTexture.type = type;


    this.target1 = new THREE.WebGLRenderTarget(width, height);
    this.target1.texture.format = THREE.RGBFormat;
    this.target1.texture.minFilter = THREE.NearestFilter;
    this.target1.texture.magFilter = THREE.NearestFilter;
    this.target1.texture.generateMipmaps = false;
    // this.target1.stencilBuffer = ( format === THREE.DepthStencilFormat ) ? true : false;
    this.target.stencilBuffer = false;
      if (format === THREE.DepthStencilFormat) {
        this.target.stencilBuffer = true;
      }
    this.target1.depthBuffer = true;
    this.target1.depthTexture = new THREE.DepthTexture(width, height);
    this.target1.depthTexture.format = format;
    this.target1.depthTexture.type = type;
  }

  private loadModel() {
    const loader = new GLTFLoader()
    this.model = '../../assets/facefull.glb';
    loader.load(this.model, (gltf) => {
      this.model = gltf.scene.children[0];
      console.log(this.model, 'model running?')
      this.model.traverse((o: THREE.Object3D) => {
        if (this.isMesh(o)) {
          console.log(o);
          o.material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        }
      });

      this.setupModel();
      this.startRenderLoop();
    })
  }

  private isMesh(obj: THREE.Object3D): obj is THREE.Mesh {
    return obj instanceof THREE.Mesh;
  }

  private setupModel() {
    this.model.position.set(0, -1, -1.5);
    this.model.rotation.set(0, 0, 0);
    this.model.scale.set(4000,2000,2000);

    this.scene.add(this.model);
  }

  // CLAUDE
  private initRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    // this.renderer.shadowMap.enabled = true;
    // this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  private startRenderLoop() {
    // if (this.renderLoop !== null) {
    //   cancelAnimationFrame(this.renderLoop);
    // }
    // this.renderLoop = requestAnimationFrame(this.renderScene);
    if (this.target && this.target1) {
      this.renderLoop = requestAnimationFrame(this.renderScene);
    } else {
      console.warn('Render targets not initialized');
    }
    // this.renderLoop = requestAnimationFrame(this.renderScene);
  }
  
  private renderScene = () => {
    // Update the model's position and rotation based on time
    if (this.model && this.model.position) {
      this.model.position.z = -1.7 + 0.15 * Math.sin(this.time / 50);
      this.model.rotation.y = +0.25 * Math.sin(this.time / 100);
    }
  
    // Update other uniforms and render the scene
    this.material.uniforms['time'].value = this.time++;
    // if (this.target.width > 0 && this.target.height > 0) {
      this.renderer.setRenderTarget(this.target);
      this.renderer.render(this.scene, this.camera1);
    // } else {
    //   console.warn('Invalid dimensions for render target');
    // }

    // if (this.target1.width > 0 && this.target1.height > 0) {
      this.material.uniforms['depthInfo'].value = this.target1.depthTexture;
      this.renderer.setRenderTarget(null);
      this.renderer.clear();
      this.renderer.render(this.scene, this.camera);
    // } else {
    //   console.warn('Invalid dimensions for render target');
    // }
    
    
  
    // Swap render targets
    let temp = this.target;
    this.target = this.target1;
    this.target1 = temp;
  
    // Request the next frame
    this.renderLoop = requestAnimationFrame(this.renderScene);
  };

  // ORIGINAL WORKING FOR RENDER
  // ngAfterViewChecked() { 
  //   if(!this.rendererInitialized && this.rendererContainer) {
  //     // const scene = document.getElementById('rendererContainer')
  //     // scene?.appendChild(this.renderer.domElement)
  //     this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);
  //     this.renderer.setSize(window.innerWidth, window.innerHeight);
  //     this.render();
  //     this.rendererInitialized = true
  //     console.log(this.renderer.domElement, 'what is here')
  //   }
  // }

  // NEW NGAFTERVIEWCHECKED
  // ngAfterViewChecked() {
  //   if (!this.rendererInitialized && this.rendererContainer) {
  //     const width = this.rendererContainer.nativeElement.offsetWidth;
  //     const height = this.rendererContainer.nativeElement.offsetHeight;
  //     if (width > 0 && height > 0) {
  //       // Create the render targets with valid dimensions
  //       this.initRenderTargets(width, height);
  //       // ... (other initialization code)
  //     } else {
  //       console.warn('Invalid dimensions for render targets');
  //     }
  //     this.rendererInitialized = true;
  //   }
  // }

  // private render = () => { 
  //   this.time++; 
  //   console.log(this.time, "TICK TOCK")

  //   if (this.model) {
  //     if (this.model.position) { // Add this null check
  //       this.model.position.z = -1.7 + 0.15 * Math.sin(this.time / 50);
  //       this.model.rotation.y = +0.25 * Math.sin(this.time / 100);
  //     } else {
  //       console.warn('Model position is undefined');
  //     }
  //   } else {
  //     console.warn('Model is undefined');
  //   }

  //   this.material.uniforms['time'].value = this.time; 

  //   this.renderer.setRenderTarget(this.target);
  //   this.renderer.render(this.scene, this.camera1);

  //   this.material.uniforms['depthInfo'].value = this.target1.depthTexture;
  //   // this.material.uniforms.progress.value = this.settings.progress;

  //   this.renderer.setRenderTarget(null);
  //   this.renderer.clear();
  //   this.renderer.render(this.scene, this.camera);

  //   // this.time += 0.05;
  //   // this.time += 0.05;
  //   // this.material.uniforms['time'].value = this.time;

  //   // requestAnimationFrame(this.render);
  //   // this.cube.rotation.x += 0.01;
  //   // this.cube.rotation.y += 0.01;
  //   // this.renderer.render(this.scene, this.camera)

  //   // swap
  //   let temp = this.target;
  //   this.target = this.target1;
  //   this.target1 = temp;
  // }

  ngOnDestroy() {
    this.renderer.dispose();
    this.scene.remove(this.cube);
    if (this.renderLoop !== null) {
      cancelAnimationFrame(this.renderLoop);
    }
    this.target.dispose();
    this.target1.dispose();
  }

  @HostListener('window:resize')
  onWindowResize() {
    const width = this.rendererContainer.nativeElement.offsetWidth;
    const height = this.rendererContainer.nativeElement.offsetHeight;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // Update render target dimensions
    this.updateRenderTargetDimensions(width, height);
  }

  updateRenderTargetDimensions(width: number, height: number) {
    this.target.setSize(width, height);
    this.target1.setSize(width, height);
  }

}
