import { Component, Input } from '@angular/core';
import { User } from '../types/User';
import { DisplaySettings } from '../types/DisplaySettings';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-trophy-case',
  templateUrl: './trophy-case.component.html',
  styleUrls: ['./trophy-case.component.scss']
})
export class TrophyCaseComponent {
  @Input() platinums = [];
  @Input() user: User;
  @Input() displaySettings: DisplaySettings;

  getLevelImage(): string {
    if (this.user.level < 100) {
      return "assets/images/bronze.png";
    }
    if (this.user.level < 200) {
      return "assets/images/bronze2.png";
    }
    if (this.user.level < 300) {
      return "assets/images/bronze3.png";
    }
    if (this.user.level < 400) {
      return "assets/images/silver.png";
    }
    if (this.user.level < 500) {
      return "assets/images/silver2.png";
    }
    if (this.user.level < 600) {
      return "assets/images/silver3.png";
    }
    if (this.user.level < 700) {
      return "assets/images/gold.png";
    }
    if (this.user.level < 800) {
      return "assets/images/gold2.png";
    }
    if (this.user.level < 999) {
      return "assets/images/gold3.png";
    }
    return "assets/images/platinum.png";
  }

  getStyle() {
    return 'repeat( auto-fill, minmax('
      + String(this.displaySettings.iconWidthPx + this.displaySettings.iconPaddingPx)
      + 'px, 1fr) )';
  }

  public save() {
    let element = document.querySelector("#capture");
    html2canvas(element as HTMLElement, { useCORS: true, scrollX: 0, scrollY: -window.scrollY }).then(function (canvas) {
      // Convert the canvas to blob
      canvas.toBlob(function (blob) {
        // To download directly on browser default 'downloads' location
        let link = document.createElement("a");
        link.download = "image.png";
        link.href = URL.createObjectURL(blob);
        link.click();

        // To save manually somewhere in file explorer
        // window.saveAs(blob, 'image.png');
      }, 'image/png');
    });
  }
}
