import { Injectable } from '@angular/core';
import { Trophy } from '../types/Trophy';

@Injectable({
  providedIn: 'root'
})
export class FilterService {

  constructor() { }

  sort(sortOrder, sortDirection, plats): void {
    if (sortOrder === "date") {
      plats.sort((a, b) => (a.num > b.num ? -1 : 1));
    }
    else if (sortOrder === "rarity") {
      plats.sort((a, b) => (a.rarity > b.rarity ? -1 : 1));
    }
    else if (sortOrder === "alpha") {
      plats.sort((a, b) => (a.game.toUpperCase() < b.game.toUpperCase() ? -1 : 1));
    }

    if (sortDirection == 'asc') {
      plats.reverse();
    }
  }

  dateFilter(startDate: Date, endDate: Date, plats) {
    // move to End of Day
    endDate.setHours(23);
    endDate.setMinutes(59);
    return plats.filter(p => {
      return p.date.getTime() >= startDate.getTime() && p.date.getTime() <= endDate.getTime();
    });
  }

  gameFilter(plats, filterQuery) {
    return plats.filter(p => {
      return p.game.toUpperCase().includes(filterQuery.toUpperCase());
    });
  }

  cabinetFilter(val: Trophy[], plats) {
    if (!val) return plats;
    return plats.filter(p => {
      return !val.includes(p);
    });
  }

}
