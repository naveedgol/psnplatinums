import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MosaicComponent } from './components/mosaic/mosaic.component';
import { WrappedComponent } from './components/wrapped/wrapped.component';
import {AppComponent} from './app.component';
import { HomeComponent } from './components/home/home.component';

const routes: Routes = [
    { path: '**', component: HomeComponent },
    // {
    //     path: 'mosaic',
    //     component: MosaicComponent
    // },
    // {
    //     path: 'wrapped',
    //     component: WrappedComponent
    // },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }