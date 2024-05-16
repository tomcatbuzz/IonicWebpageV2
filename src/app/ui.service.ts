import { Injectable, inject } from '@angular/core';
import { ToastController } from '@ionic/angular'

@Injectable({
  providedIn: 'root'
})
export class UIService {
  private toastController = inject(ToastController)

  constructor() { }

  async presentToast(message: any, duration: any) {
    const toast = await this.toastController.create({
      message,
      duration,
      position: 'top',
      color: 'dark'
    });
    toast.present();
  }
}
