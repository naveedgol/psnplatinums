import { Component, ViewChild } from '@angular/core';
import { PsnService } from '../../services/psn.service';
import { FormGroup, FormControl } from '@angular/forms';
import { User } from '../../types/User';
import { DisplaySettings } from '../../types/DisplaySettings';
import { Trophy } from '../../types/Trophy';

@Component({
  selector: 'app-mosaic',
  templateUrl: './mosaic.component.html',
  styleUrls: ['./mosaic.component.scss']
})
export class MosaicComponent {
  @ViewChild('trophyCase', { static: false }) trophyCase;

  currentPlats: Trophy[] = [];
  isSaveLoading = false;
  sortOrder = 'date';
  sortDirection = 'des';
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

  constructor(public psnService: PsnService) {
    this.applyFilters();
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

  cabinetFilter(val: Trophy[]): void {
    if (!val) return;
    this.currentPlats = this.currentPlats.filter(p => {
      return !val.includes(p);
    });
  }

  applyFilters(): void {
    this.currentPlats = this.psnService.platinums;
    this.cabinetFilter(this.cabinetForm.value);
    this.dateChanged();
    this.sort();
    this.gameFilter();
  }

  uponIsSaveLoading(stateChange: boolean): void {
    this.isSaveLoading = stateChange;
  }

  cabinetForm = new FormControl();

  cabinetChange(event) {
    console.log(event);
  }
}

