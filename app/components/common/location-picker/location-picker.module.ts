import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { I18nModule } from "@batch-flask/core";
import { FormModule, I18nUIModule, SelectModule } from "@batch-flask/ui";
import { LocationModule } from "../location/location.module";
import { LocationPickerComponent } from "./location-picker.component";

const publicComponents = [LocationPickerComponent];
const privateComponents = [];

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        LocationModule,
        SelectModule,
        FormModule,
        I18nModule,
        I18nUIModule,
    ],
    declarations: [...publicComponents, ...privateComponents],
    exports: publicComponents,
    entryComponents: [],
})
export class LocationPickerModule {
}
