import { Component } from '@angular/core';
import { PsnService } from 'src/app/services/psn.service';
import { Trophy } from 'src/app/types/Trophy';
import { interval } from 'rxjs';
import { FilterService } from 'src/app/services/filter.service';
import { DisplaySettings } from '../../types/DisplaySettings';

@Component({
  selector: 'app-wrapped',
  templateUrl: './wrapped.component.html',
  styleUrls: ['./wrapped.component.scss']
})
export class WrappedComponent {

  firstPlatinum: Trophy;
  lastPlatinum: Trophy;
  busiestMonth: string;
  busiestMonthCount: number;
  avgRarity = 0.0;
  platCount = 0;
  rarePlats = [];
  commonPlats = [];
  busyMonthPlats = [];
  yearPlats = [];
  busyIdx = 0;

  idx = 10;

  displaySettings: DisplaySettings = {
    iconType: "TROPHY",
    iconWidthPx: 70,
    columnSpacingPx: 15,
    rowSpacingPx: 8,
    isSortAscending: false,
    displayUserInfo: false,
    displayTrophyCounts: false,
    displayGameTitle: true,
    displayTrophyTitle: false,
    displayRarity: true
  };

  yearDS: DisplaySettings = {
    iconType: "TROPHY",
    iconWidthPx: 70,
    columnSpacingPx: 15,
    rowSpacingPx: 8,
    isSortAscending: false,
    displayUserInfo: false,
    displayTrophyCounts: false,
    displayGameTitle: true,
    displayTrophyTitle: false,
    displayRarity: false
  };

  calcBusyMonth(plats: Trophy[]) {
    let arr = new Array<number>(12);
    for (let i = 0; i < 12; i++) {
      arr[i] = 0;
    }

    for (let plat of plats) {
      arr[plat.date.getMonth()]++;
    }

    let maxMonthIdx = -1;
    let currMax = 0;
    for (let i = 0; i < 12; i++) {
      if (arr[i] > currMax) {
        maxMonthIdx = i;
        currMax = arr[i];
      }
    }

    const months = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "Decemeber"];
    if (maxMonthIdx != -1) {
      this.busiestMonth = months[maxMonthIdx];
      this.busiestMonthCount = arr[maxMonthIdx];
    }

    for (let plat of plats) {
      if (plat.date.getMonth() === maxMonthIdx) {
        this.busyMonthPlats.push(plat);
      }
    }
  }

  calcRarity(plats: Trophy[]) {
    for (let plat of plats) {
      this.avgRarity += plat.rarity;
    }
    this.avgRarity /= plats.length;
    for (let i = 0; i < plats.length; ++i) {
      if (plats[i].rarity < 10)
        this.rarePlats.push(plats[i]);
      if (this.rarePlats.length > 10)
        break;
    }
  }

  constructor(public psnService: PsnService, private filterService: FilterService) {
    this.yearPlats = filterService.dateFilter(new Date('January 1, 2020'), new Date('December 31, 2020'), psnService.platinums);
    filterService.sort("date", "asc", this.yearPlats);
    this.firstPlatinum = this.yearPlats[0];
    this.lastPlatinum = this.yearPlats[this.yearPlats.length - 1];
    this.calcBusyMonth(this.yearPlats);
    filterService.sort("rarity", "asc", this.yearPlats);
    this.calcRarity(this.yearPlats);
    this.platCount = this.yearPlats.length;

    interval(1000).subscribe(x => {
      this.busyIdx = (this.busyIdx + 1) % this.busyMonthPlats.length;
    })
  }

}
