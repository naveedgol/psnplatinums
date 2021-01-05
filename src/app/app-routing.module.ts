import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MosaicComponent } from './components/mosaic/mosaic.component';
import { WrappedComponent } from './components/wrapped/wrapped.component';

const routes: Routes = [
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