import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-about-page',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="about-page container" id="about-view">
      <div class="about-header">
        <h1 class="page-title">من نحن / About Us</h1>
        <p class="page-desc">قصة دار الوصل للنشر والتوزيع ورؤيتنا الثقافية.</p>
      </div>

      <div class="content-grid">
        <div class="text-block">
          <h2>رسالتنا / Our Mission</h2>
          <p>
            تأسست دار الوصل للنشر بهدف سد الفجوة الثقافية وتقديم إسهامات فكرية وأدبية متميزة باللغتين العربية والإنجليزية. نحن نسعى لتقديم أفضل الروايات والكتب المعرفية التي تلهم العقول وتغذي شغف القراء في كل مكان.
          </p>
          <p>
            We established ElWasl Publishing with the goal of bridging cultural gaps and presenting distinguished intellectual and literary contributions in both Arabic and English. We strive to offer the best novels and educational books that inspire minds and feed the passion of readers everywhere.
          </p>
        </div>

        <div class="text-block">
          <h2>رؤيتنا / Our Vision</h2>
          <p>
            نسعى لأن نكون الدار الرائدة في تقديم المحتوى المتنوع والدمج بين وسائل القراءة الكلاسيكية (الورقية) والحديثة (الكتب الصوتية والرقمية)، إلى جانب ابتكار ألعاب الورق الجماعية التي تضفي المتعة والترابط بين الأفراد.
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @import '../../../../styles/variables';
    @import '../../../../styles/mixins';

    .about-page {
      padding-top: 2rem;
      padding-bottom: 4rem;
      display: flex;
      flex-direction: column;
      gap: 3rem;
    }

    .about-header {
      border-bottom: 1px solid $border-color;
      padding-bottom: 1.5rem;
      
      .page-title {
        font-size: 2rem;
        font-weight: 800;
        color: $primary-dark;
      }
      
      .page-desc {
        color: $text-muted;
        font-size: 1rem;
        margin-top: 0.5rem;
      }
    }

    .content-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2.5rem;
      
      @include respond-to('md') {
        grid-template-columns: 1fr 1fr;
      }
    }

    .text-block {
      background-color: white;
      border: 1px solid $border-color;
      border-radius: $border-radius;
      padding: 2rem;
      box-shadow: $shadow-sm;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      
      h2 {
        font-size: 1.35rem;
        font-weight: 700;
        color: $primary-color;
        border-bottom: 2px solid rgba($primary-light, 0.1);
        padding-bottom: 0.5rem;
      }
      
      p {
        font-size: 1rem;
        color: $text-dark;
        line-height: 1.8;
      }
    }
  `]
})
export class AboutPageComponent {}
