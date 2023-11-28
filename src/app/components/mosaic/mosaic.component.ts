import { Component, ViewChild } from '@angular/core';
import { PsnService } from '../../services/psn.service';
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { User } from '../../types/User';
import { DisplaySettings } from '../../types/DisplaySettings';
import { Trophy } from '../../types/Trophy';
import { FilterService } from 'src/app/services/filter.service';

@Component({
  selector: 'app-mosaic',
  templateUrl: './mosaic.component.html',
  styleUrls: ['./mosaic.component.scss'],
})
export class MosaicComponent {
  @ViewChild('trophyCase', { static: false }) trophyCase;

  currentPlats: Trophy[] = [];
  isSaveLoading = false;
  sortOrder = 'date';
  sortDirection = 'des';
  range = new UntypedFormGroup({
    start: new UntypedFormControl(new Date('January 1, 2007')),
    end: new UntypedFormControl(new Date()),
  });
  gameFilterQuery = '';

  displaySettings: DisplaySettings = {
    iconType: 'TROPHY',
    iconWidthPx: 56,
    width: 0,
    columnSpacingPx: 6,
    rowSpacingPx: 4,
    isSortAscending: false,
    displayUserInfo: true,
    displayTrophyCounts: true,
    displayGameTitle: false,
    displayTrophyTitle: false,
    displayRarity: false,
    displayDateUnlocked: false,
    displayWatermark: true,
    color: 'BLUE',
  };

  constructor(
    public psnService: PsnService,
    private filterService: FilterService
  ) {
    this.applyFilters();
  }

  applyFilters(): void {
    this.currentPlats = this.psnService.platinums;
    this.currentPlats = this.filterService.cabinetFilter(this.cabinetForm.value, this.currentPlats);
    this.currentPlats = this.filterService.dateFilter(
      new Date(this.range.value.start),
      new Date(this.range.value.end),
      this.currentPlats
    );
    this.filterService.sort(this.sortOrder, this.sortDirection, this.currentPlats);
    this.currentPlats = this.filterService.gameFilter(this.currentPlats, this.gameFilterQuery);
  }

  uponIsSaveLoading(stateChange: boolean): void {
    this.isSaveLoading = stateChange;
  }

  cabinetForm = new UntypedFormControl();
}
