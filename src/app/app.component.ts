import { Component } from '@angular/core';
import { environment } from '../environments/environment';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {

    constructor() {
        if (environment.googleAnalytics.enabled) {
            this.appendGoogleAnalyticsCode();
        }
    }

    appendGoogleAnalyticsCode(): any {
        const gtagScript = document.createElement('script');
        gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${environment.googleAnalytics.trackingId}`;
        gtagScript.type = 'text/javascript';
        gtagScript.async = true;
        gtagScript.charset = 'utf-8';

        document.head.appendChild(gtagScript);

        const script = document.createElement('script');

        script.innerHTML = `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', '${environment.googleAnalytics.trackingId}');
        `;

        document.head.appendChild(script);
    }
}
