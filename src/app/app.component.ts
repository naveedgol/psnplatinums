import { Component } from '@angular/core';
import { PsnService } from './services/psn.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {

    mode = '';
    loading = false;
    error = '';
    profileFetched = false;

    constructor(public psnService: PsnService) { }

    search(val: string): void {
        this.error = '';
        this.loading = true;
        this.profileFetched = false;

        this.psnService.fetchProfile(val)
            .then(() => {
                this.loading = false;
                this.profileFetched = true;
            })
            .catch(err => {
                console.log(err);
                this.error = err;
                this.loading = false;
            });
    }
}

