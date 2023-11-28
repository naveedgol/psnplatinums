import { Component } from '@angular/core';
import { PsnService } from '../../services/psn.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent {

    mode = 'mosaic';
    loading = false;
    loadingProgress = { fetched: 0, total: 1 };
    error = '';
    profileFetched = true;
    query = '';

    constructor(
        public psnService: PsnService, 
        private router: Router, 
        private route: ActivatedRoute) { 
        const urlSegments = this.route.snapshot.url;

        if (urlSegments.length > 0) {
            this.query = urlSegments[0].path;
            this.search()
        }
    }

    search(): void {
        let val = this.query;
        val = val.replace(/\s/g, "");
        if (val.length === 0) {
            this.error = 'Enter a valid PSN name';
            return;
        }
        this.loadingProgress = { fetched: 0, total: 1 };
        this.error = '';
        this.loading = true;
        this.profileFetched = false;

        this.router.navigate(['/' + val]);
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

