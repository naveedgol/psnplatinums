import { Component, ViewChild } from '@angular/core';
import { PsnService } from './services/psn.service';
import { FormGroup, FormControl } from '@angular/forms';
import { User } from './types/User';
import { DisplaySettings } from './types/DisplaySettings';
import { Trophy } from './types/Trophy';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild('trophyCase', { static: false }) trophyCase;

  platinums: Trophy[] = [];
  currentPlats: Trophy[] = [];
  user: User;
  userId = '';
  loading = false;
  isSaveLoading = false;
  sortOrder = 'date';
  sortDirection = 'des';
  error = false;
  throttleError = false;
  adblockError = false;
  range = new FormGroup({
    start: new FormControl(new Date('January 1, 2007')),
    end: new FormControl(new Date())
  });
  gameFilterQuery = '';

  displaySettings: DisplaySettings = {
    iconType: "TROPHY",
    iconWidthPx: 56,
    columnSpacingPx: 6,
    rowSpacingPx: 4,
    isSortAscending: false,
    displayUserInfo: true,
    displayTrophyCounts: true,
    displayGameTitle: false,
    displayTrophyTitle: false,
    displayRarity: false
  };

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
                this.applyFilters();
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

  sort(): void {
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

  dateChanged(): void {
    const startDate: Date = new Date(this.range.value.start);
    const endDate: Date = new Date(this.range.value.end);
    // move to End of Day
    endDate.setHours(23);
    endDate.setMinutes(59);
    this.currentPlats = this.currentPlats.filter(p => {
      return p.date.getTime() >= startDate.getTime() && p.date.getTime() <= endDate.getTime();
    });
  }

  gameFilter(): void {
    this.currentPlats = this.currentPlats.filter(p => {
      return p.game.toUpperCase().includes(this.gameFilterQuery.toUpperCase());
    });
  }

  applyFilters(): void {
    this.currentPlats = this.platinums;
    this.dateChanged();
    this.sort();
    this.gameFilter();
  }

  uponIsSaveLoading(stateChange: boolean): void {
    this.isSaveLoading = stateChange;
  }
}

