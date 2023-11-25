import { Component } from '@angular/core';
import { PsnService } from './services/psn.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {

    mode = 'mosaic';
    loading = false;
    loadingProgress = { fetched: 0, total: 1 };
    error = '';
    profileFetched = true;

    constructor(public psnService: PsnService) { }

    search(val: string): void {
        val = val.replace(/\s/g, "");
        if (val.length === 0) {
            this.error = 'Enter a valid PSN name';
            return;
        }
        this.loadingProgress = { fetched: 0, total: 1 };
        this.error = '';
        this.loading = true;
        this.profileFetched = false;

        this.psnService.fetchProfile(val, this.loadingProgress)
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

