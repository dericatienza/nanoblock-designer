import { Component } from '@angular/core';
import { environment } from '../environments/environment';
import { Angulartics2GoogleGlobalSiteTag } from 'angulartics2/gst';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {

    constructor(private _angulartics: Angulartics2GoogleGlobalSiteTag) {
        if (environment.googleAnalytics.enabled) {
            this.appendGoogleAnalyticsCode();
            this._angulartics.startTracking();
        }
    }

    appendGoogleAnalyticsCode(): any {
        const gtagScript = document.createElement('script');
        gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${environment.googleAnalytics.trackingId}`;
        gtagScript.type = 'text/javascript';
        gtagScript.async = true;
        gtagScript.charset = 'utf-8';

        document.head.append(gtagScript);

        const script = document.createElement('script');

        script.innerHTML = `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', '${environment.googleAnalytics.trackingId}');
        `;

        document.head.append(script);
    }
}
