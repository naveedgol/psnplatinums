import { Component, ViewChild } from '@angular/core';
import { PsnService } from '../../services/psn.service';
import { FormGroup, FormControl } from '@angular/forms';
import { User } from '../../types/User';
import { DisplaySettings } from '../../types/DisplaySettings';
import { Trophy } from '../../types/Trophy';
import { FilterService } from 'src/app/services/filter.service';

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
    displayRarity: false,
    displayWatermark: true,
    color: "BLUE"
  };

  constructor(public psnService: PsnService,
    private filterService: FilterService) {
    this.applyFilters();
  }

  applyFilters(): void {
    this.currentPlats = this.psnService.platinums;
    this.currentPlats = this.filterService.cabinetFilter(this.cabinetForm.value, this.currentPlats);
    this.currentPlats = this.filterService.dateFilter(new Date(this.range.value.start), new Date(this.range.value.end), this.currentPlats);
    this.filterService.sort(this.sortOrder, this.sortDirection, this.currentPlats);
    this.currentPlats = this.filterService.gameFilter(this.currentPlats, this.gameFilterQuery);
  }

  uponIsSaveLoading(stateChange: boolean): void {
    this.isSaveLoading = stateChange;
  }

  cabinetForm = new FormControl();
}

