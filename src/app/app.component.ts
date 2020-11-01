import { Component } from '@angular/core';
import { PsnService, User } from './psn.service';
import html2canvas from 'html2canvas';
import { MatInput } from '@angular/material/input';
import { MatRadioChange } from '@angular/material/radio';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  platinums = [];
  currentPlats = [];
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
  throttleError = false;
  adblockError = false;
  range = new FormGroup({
    start: new FormControl(new Date('January 1, 2007')),
    end: new FormControl(new Date())
  });

  constructor(
    public psnService: PsnService
  ) {
  }

  search(val): void {
    if (val === '' || val === this.userId) {
      return;
    }
    this.error = false;
    this.adblockError = false;
    this.throttleError = false;
    this.loading = true;
    this.user = undefined;
    this.platinums = [];
    this.currentPlats = []
    this.userId = val;
    this.psnService.getProfile(this.userId).subscribe(
      data => {
        this.user = this.psnService.parseUser(data, this.userId);
        if (this.user === undefined) {
          console.log("User does not exist.");
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
              this.currentPlats = this.platinums;
              if (this.platinums.length === this.user.platinumCount) {
                this.loading = false;
                this.sort();
              }
            }, error => {
              console.log("platpage" + ((i / 50) + 1), error);
              this.adblockError = true;
            }
          );
        }
      }, error => {
        console.log("profile", error);
        if (error.status === 429) {
          this.throttleError = true;
          console.log("throttled");
        }
      }
    );
  }

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
    return 'repeat( auto-fill, minmax(' + String(this.iconWidth + this.iconPadding) + 'px, 1fr) )';
  }

  save() {
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

  sort(event?: MatRadioChange) {
    if (this.sortOrder === "date") {
      this.currentPlats.sort((a, b) => (a.num > b.num ? -1 : 1));
    }
    else if (this.sortOrder === "rarity") {
      this.currentPlats.sort((a, b) => (a.rarity > b.rarity ? -1 : 1));
    }
    else if (this.sortOrder === "alpha") {
      this.currentPlats.sort((a, b) => (a.game.toUpperCase() < b.game.toUpperCase() ? -1 : 1));
    }

    if (this.sortDirection == 'asc') {
      this.currentPlats.reverse();
    }
  }

  dateChanged(event) {
    let startDate: Date = new Date(this.range.value.start);
    let endDate: Date = new Date(this.range.value.end);
    this.currentPlats = this.platinums.filter(p => {
      return p.date.getTime() >= startDate.getTime() && p.date.getTime() <= endDate.getTime();
    });
  }
}

