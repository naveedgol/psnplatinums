import { Component, Input, Output, EventEmitter } from '@angular/core';
import { User } from '../../types/User';
import { Trophy } from '../../types/Trophy';
import { DisplaySettings } from '../../types/DisplaySettings';
import html2canvas from 'html2canvas';
import { from } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-trophy-case',
  templateUrl: './trophy-case.component.html',
  styleUrls: ['./trophy-case.component.scss']
})
export class TrophyCaseComponent {
  @Input() platinums: Trophy[] = [];
  @Input() cabinet: Trophy[] = [];
  @Input() user: User;
  @Input() displaySettings: DisplaySettings;
  @Output() uponIsSaveLoading: EventEmitter<any> = new EventEmitter(false);

  constructor(private http: HttpClient) {
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

  getStyle(): string {
    return 'repeat( auto-fill, minmax('
      + String(this.displaySettings.iconWidthPx + this.displaySettings.columnSpacingPx)
      + 'px, 1fr) )';
  }

  public save(): void {
    this.uponIsSaveLoading.emit(true);
    let element = document.querySelector("#capture");
    from(html2canvas(element as HTMLElement, { useCORS: true, scrollX: 0, scrollY: -window.scrollY })).subscribe(
      canvas => {
        (canvas as HTMLCanvasElement).toBlob((blob) => {
          // To download directly on browser default 'downloads' location
          let link = document.createElement("a");
          link.download = "image.png";
          link.href = URL.createObjectURL(blob);
          link.click();

          // To save manually somewhere in file explorer
          // window.saveAs(blob, 'image.png');
        }, 'image/png');
        this.uponIsSaveLoading.emit(false);
      }
    )
  }

  public share() {
    this.shareImpl().then(redditLink => {
      // window open can't be within async or it is deemed popup by safari
      window.open(redditLink, "_blank");
    });
  }

  // async'd so everything is ready before new tab opened
  async shareImpl() {
    this.uponIsSaveLoading.emit(true);

    // leverage html2canvas to convert from dom to canvas to blob
    const element: HTMLElement = document.querySelector("#capture");
    const canvas: HTMLCanvasElement = await html2canvas(element, { useCORS: true, scrollX: 0, scrollY: -window.scrollY })
    const blob: Blob = await new Promise(resolve => canvas.toBlob(resolve));

    // prep imgur POST request to upload blob
    var data = new FormData();
    data.append("image", blob);

    const clientId = "eec09f734fad776";
    const options = {
      responseType: 'json' as const,
      headers: { "Authorization": "Client-ID " + clientId },
    };

    const imgurResponse = await this.http.post("https://api.imgur.com/3/image", data, options).toPromise();

    // open reddit post link to open in new tab
    const imgurLink = imgurResponse["data"]["link"];
    const redditLink = "http://www.reddit.com/submit?url=" + imgurLink + "&title=%5BMultiple+Games%5D+My+Platinum+mosaic+built+with+PSNplatinums.com";

    this.uponIsSaveLoading.emit(false);

    return redditLink;
  }
}
