import { Component } from '@angular/core';
import { PsnService, User } from './psn.service';
import html2canvas from 'html2canvas';
import { MatInput } from '@angular/material/input';
import { MatRadioChange } from '@angular/material/radio';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  platinums = [];
  user: User;
  userId = '';
  iconWidth = 56;
  iconPadding = 6;
  displayUserInfo = true;
  displayTrophyCounts = true;
  displayTrophyTitle = false;
  displayGameTitle = false;
  displayRarity = false;
  iconType = 'trophy';
  loading = false;
  sortOrder = 'date';
  sortDirection = 'des';
  error = false;

  constructor(
    public psnService: PsnService
  ) {
    // this.search('phoenixgreen') 
  }

  search(val): void {
    if (val === '' || val === this.userId) {
      return;
    }
    this.error = false;
    this.loading = true;
    this.platinums = [];
    this.userId = val;
    this.psnService.getProfile(this.userId).subscribe(
      data => {
        this.user = this.psnService.parseUser(data, this.userId);
        if (this.user === undefined) {
          this.error = true;
          this.loading = false;
          return;
        }
        if (this.user.platinumCount === 0) {
          this.loading = false;
        }
        for (var i = 0; i < this.user.platinumCount; i += 50) {
          this.psnService.getPlatinums(this.userId, (i / 50) + 1).subscribe(
            data => {
              this.platinums = this.platinums.concat(this.psnService.parsePlats(data));
              if (this.platinums.length === this.user.platinumCount) {
                this.loading = false;
                this.platinums.sort((a, b) => (a.num > b.num ? -1 : 1));
              }
            }, error => {
              console.log("platpage" + ((i / 50) + 1), error);
            }
          );
        }
      }, error => {
        console.log("profile", error);
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

  sort(event: MatRadioChange) {
    if (this.sortOrder === "date") {
      this.platinums.sort((a, b) => (a.num > b.num ? -1 : 1));
    }
    else if (this.sortOrder === "rarity") {
      this.platinums.sort((a, b) => (a.rarity > b.rarity ? -1 : 1));
    }
    else if (this.sortOrder === "alpha") {
      this.platinums.sort((a, b) => (a.game.toUpperCase() < b.game.toUpperCase() ? -1 : 1));
    }

    if (this.sortDirection == 'asc') {
      this.platinums.reverse();
    }
  }
}

