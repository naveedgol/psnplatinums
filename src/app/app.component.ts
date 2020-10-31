import { Component } from '@angular/core';
import { PsnService, User } from './psn.service';
import html2canvas from 'html2canvas';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  platinums = [];
  user: User;
  userId = 'PhoenixGreen';
  iconWidth = 56;
  iconPadding = 6;
  displayUserInfo = true;
  displayTrophyCounts = true;
  displayTrophyTitle = false;
  displayGameTitle = false;
  displayRarity = false;
  iconType = 'trophy';

  constructor(
    public psnService: PsnService
  ) { }

  search(val): void {
    if (val === '') {
      return;
    }
    this.platinums = [];
    this.userId = val;
    this.psnService.getProfile(this.userId).subscribe(
      data => {
        this.user = this.psnService.parseUser(data, this.userId);
        for (var i = 0; i < this.user.platinumCount; i += 50) {
          console.log(i / 50 + 1);
          this.psnService.getPlatinums(this.userId, (i / 50) + 1).subscribe(
            data => {
              this.platinums = this.platinums.concat(this.psnService.parsePlats(data));
              this.platinums.sort((a, b) => (a.num > b.num ? -1 : 1));
            }
          );
        }
      }
    );
  }

  getLevelImage(): string {
    return "assets/images/platinum.png";
  }

  getStyle() {
    return 'repeat( auto-fill, minmax(' + String(this.iconWidth + this.iconPadding) + 'px, 1fr) )';
  }

  save() {
    let element = document.querySelector("#capture");
    html2canvas(element as HTMLElement, { useCORS: true }).then(function (canvas) {
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

