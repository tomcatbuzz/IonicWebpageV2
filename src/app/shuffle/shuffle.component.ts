import { Component, ElementRef, HostListener, Input, OnDestroy, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { TextPlugin } from 'gsap/TextPlugin';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
// import { IonContent } from "@ionic/angular/standalone";
import { CommonModule } from '@angular/common';

// import { IonContent } from "@ionic/angular/standalone";

gsap.registerPlugin(SplitText, ScrambleTextPlugin);

@Component({
  selector: 'app-shuffle',
  templateUrl: './shuffle.component.html',
  styleUrls: ['./shuffle.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class ShuffleComponent implements AfterViewInit, OnDestroy {

  @Input() text: string = '';
  @Input() duration: number = 0.5;
  @Input() stagger: number = 0.02;
  @Input() shuffleCount: number = 3;
  
  
  private splitText: SplitText | null = null;
  // private scrambleText: ScrambleTextPlugin | null = null;
  // private scrambleText: any;
  private timeline: GSAPTimeline | null = null;

  constructor(private el: ElementRef) { }

  ngAfterViewInit() {
    this.initializeShuffle()
  }

  ngOnDestroy() {
    if (this.splitText) {
      this.splitText.revert()
    }
    if (this.timeline) {
      this.timeline.kill()
    }
  }

  // @HostListener('mouseenter') onMouseEnter() {
  //   this.initializeShuffle()
  //   console.log('mouse enter')
  // }

  private initializeShuffle() {
    const container = this.el.nativeElement.querySelector('div');

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';

    this.timeline = gsap.timeline({
      defaults: { duration: 2, ease: 'none' }
    });

    this.timeline.to('#textContainer', {
      duration: 3,
      scrambleText: { text: this.text, chars: alphabet, revealDelay: 0.5,
      tweenLength: false }
    })
  }
}
