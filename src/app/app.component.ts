import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  folderOutline,
  musicalNotesOutline,
  videocamOutline,
  documentOutline,
  chevronForwardOutline,
} from 'ionicons/icons';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss'],
    standalone: true,
    imports: [IonApp, IonRouterOutlet]
})
export class AppComponent {
  constructor() {
    // 🔥 Register Ionic 8 icons globally
    addIcons({
      folderOutline,
      musicalNotesOutline,
      videocamOutline,
      documentOutline,
      chevronForwardOutline,
    });
  }
}
