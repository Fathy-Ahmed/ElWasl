import { bootstrapApplication } from '@angular/platform-browser';
import { inject } from '@vercel/analytics';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { injectSpeedInsights } from '@vercel/speed-insights';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));

// Inject Vercel Speed Insights
injectSpeedInsights();
// Initialize Vercel Analytics
inject();
