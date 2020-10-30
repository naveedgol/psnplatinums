import { Component } from '@angular/core';
import { PsnService, User } from './psn.service';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  platinums = [];
  user: User;

  constructor(
    public psnService: PsnService
  ) {
    const user_id = 'PhoenixGreen';

    psnService.getProfile(user_id).subscribe(
      data => {
        this.user = psnService.parseUser(data, user_id);
        console.log(this.user);

        for (var i = 0; i <= this.user.platinumCount / 50; ++i) {
          psnService.getPlatinums(user_id, i + 1).subscribe(
            data => {
              this.platinums = this.platinums.concat(psnService.parsePlats(data));
              this.platinums.sort((a, b) => (a.num > b.num ? -1 : 1));
            }
          );
        }
      }
    );


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
