import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ServiceItem {
  id: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  icon: string;
  visualType: 'eshop' | 'publishing' | 'fairs' | 'default';
  buttonTextAr?: string;
  buttonTextEn?: string;
}

export interface AuthorItem {
  nameAr: string;
  nameEn: string;
  photo: string;
  countAr: string;
  countEn: string;
  bioAr: string;
  bioEn: string;
}

export interface DistributorItem {
  id: string;
  nameAr: string;
  nameEn: string;
  addressAr: string;
  addressEn: string;
  phone: string;
  email: string;
  hoursAr: string;
  hoursEn: string;
  cx: number;
  cy: number;
  r: number;
  class: string;
}

export interface HomepageData {
  services: ServiceItem[];
  authorCount: number;
  authors: AuthorItem[];
  distributors: DistributorItem[];
}

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  private readonly STORAGE_KEY = 'elwasl_homepage_content';

  private readonly defaultServices: ServiceItem[] = [
    {
      id: 'eshop',
      titleAr: 'متجر الروايات الإلكتروني',
      titleEn: 'Novel E-Shop',
      descAr: 'تصفح مكتبتنا الإلكترونية الشاملة، واشترِ الروايات والكتب الورقية والألعاب المبتكرة مباشرة مع خيارات دفع آمنة وتوصيل سريع لباب منزلك.',
      descEn: 'Browse our comprehensive online bookstore and buy print novels, audiobooks, and innovative board games directly with secure payment options and fast home delivery.',
      icon: 'shopping_bag',
      visualType: 'eshop'
    },
    {
      id: 'publishing',
      titleAr: 'خدمات المؤلفين والطباعة',
      titleEn: 'Author Services & Publishing',
      descAr: 'هل لديك رواية أو كتاب جاهز للنشر؟ نقدم خدمات تحرير وتنسيق احترافية وتصميم أغلِفة مميزة، بالإضافة لطباعة ورقية وتوزيع عربي شامل وعالمي.',
      descEn: 'Do you have a novel or book ready for publication? We offer professional editing, formatting, cover design, print publishing, and wide distribution.',
      icon: 'auto_stories',
      visualType: 'publishing',
      buttonTextAr: 'انشر معنا',
      buttonTextEn: 'Publish With Us'
    },
    {
      id: 'fairs',
      titleAr: 'منافذ البيع والمعارض',
      titleEn: 'Points of Sale & Fairs',
      descAr: 'تتواجد كتب وروايات دار الوصل في كبرى المكتبات العربية، ونشارك سنوياً في المعارض الدولية (القاهرة، الرياض، الشارقة، أبوظبي).',
      descEn: 'Dar ElWasl books and novels are available in major Arab libraries. We participate annually in international book fairs.',
      icon: 'map',
      visualType: 'fairs'
    }
  ];

  private readonly defaultAuthors: AuthorItem[] = [
    {
      nameAr: 'نجيب محفوظ',
      nameEn: 'Naguib Mahfouz',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
      countAr: '42 رواية',
      countEn: '42 Novels',
      bioAr: 'أول كاتب عربي يحصل على جائزة نوبل في الأدب. تم نشر العديد من روائعه وإصداراته المتميزة بالتعاون مع الدار.',
      bioEn: 'The first Arab writer to receive the Nobel Prize in Literature. Many of his masterpieces and prominent editions were published in collaboration with the House.'
    },
    {
      nameAr: 'أحمد مراد',
      nameEn: 'Ahmed Mourad',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
      countAr: '9 روايات',
      countEn: '9 Novels',
      bioAr: 'أحد أشهر كتاب الرواية المعاصرين في مصر والعالم العربي، مؤلف العديد من الروايات الأكثر مبيعاً.',
      bioEn: 'One of the most famous contemporary novel writers in Egypt and the Arab world, author of several best-selling novels.'
    },
    {
      nameAr: 'رضوى عاشور',
      nameEn: 'Radwa Ashour',
      photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
      countAr: '15 كتاباً',
      countEn: '15 Books',
      bioAr: 'روائية وناقدة أدبية مصرية وأستاذة جامعية، تميزت أعمالها بالعمق التاريخي والإنساني مثل ثلاثية غرناطة.',
      bioEn: 'An Egyptian novelist, literary critic, and university professor, her works were characterized by historical and human depth like Granada Trilogy.'
    },
    {
      nameAr: 'الطيب صالح',
      nameEn: 'Tayeb Salih',
      photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
      countAr: '6 روايات',
      countEn: '6 Novels',
      bioAr: 'أحد أشهر الكتاب العرب في القرن العشرين، ولقب بعبقري الرواية العربية وصاحب موسم الهجرة إلى الشمال.',
      bioEn: 'One of the most famous Arab writers of the twentieth century, and nicknamed the genius of the Arabic novel and author of Season of Migration to the North.'
    },
    {
      nameAr: 'أحمد خالد توفيق',
      nameEn: 'Ahmed Khaled Towfik',
      photo: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=150',
      countAr: '80 كتاباً',
      countEn: '80 Books',
      bioAr: 'عراب أدب الشباب في العالم العربي، وأول كاتب عربي بارز في مجال أدب الرعب والخيال العلمي والإثارة.',
      bioEn: 'The godfather of youth literature in the Arab world, and the first prominent Arab writer in the field of horror, science fiction, and thriller.'
    },
    {
      nameAr: 'خولة حمدي',
      nameEn: 'Khawla Hamdi',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      countAr: '7 روايات',
      countEn: '7 Novels',
      bioAr: 'كاتبة تونسية وأستاذة جامعية، اشتهرت بروايتها الأكثر مبيعاً "في قلبي أنثى عبرية" والتي تميزت بعمقا الاجتماعي والديني.',
      bioEn: 'A Tunisian writer and university professor, famous for her bestselling novel "In My Heart a Hebrew Female" which was characterized by social and religious depth.'
    },
    {
      nameAr: 'يوسف زيدان',
      nameEn: 'Youssef Ziedan',
      photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150',
      countAr: '18 كتاباً',
      countEn: '18 Books',
      bioAr: 'كاتب ومفكر وباحث مصري متخصص في التراث الإسلامي والمخطوطات، وصاحب رواية عزازيل الفائزة بالبوكر.',
      bioEn: 'An Egyptian writer, thinker, and researcher specializing in Islamic heritage and manuscripts, and author of the Booker-winning novel Azazeel.'
    },
    {
      nameAr: 'إليف شافاق',
      nameEn: 'Elif Shafak',
      photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
      countAr: '12 رواية',
      countEn: '12 Novels',
      bioAr: 'روائية تركية حائزة على جوائز عالمية وتكتب باللغتين التركية والإنجليزية، صاحبة رواية قواعد العشق الأربعون.',
      bioEn: 'An award-winning Turkish novelist writing in both Turkish and English, author of the global bestselling novel The Forty Rules of Love.'
    }
  ];

  private readonly defaultDistributors: DistributorItem[] = [
    {
      id: 'd1',
      nameAr: 'القاهرة - المقر الرئيسي',
      nameEn: 'Cairo - Main Headquarters',
      addressAr: '١٦٥ شارع محمد فريد - وسط البلد - القاهرة',
      addressEn: '165 Mohamed Farid St - Downtown - Cairo',
      phone: '+201118440716',
      email: 'elwaslbook2023@gmail.com',
      hoursAr: '٩:٠٠ ص - ١٠:٠٠ م',
      hoursEn: '9:00 AM - 10:00 PM',
      cx: 170,
      cy: 95,
      r: 4,
      class: 'map-dot map-dot-pulse'
    },
    {
      id: 'd2',
      nameAr: 'الرياض - فرع المملكة العربية السعودية',
      nameEn: 'Riyadh Branch - KSA',
      addressAr: 'طريق الملك فهد - العليا - الرياض',
      addressEn: 'King Fahd Road - Al Olaya - Riyadh',
      phone: '+966114567890',
      email: 'riyadh@elwasl.com',
      hoursAr: '١٠:٠٠ ص - ١١:٠٠ م',
      hoursEn: '10:00 AM - 11:00 PM',
      cx: 190,
      cy: 102,
      r: 3,
      class: 'map-dot'
    },
    {
      id: 'd3',
      nameAr: 'دبي - فرع الإمارات العربية المتحدة',
      nameEn: 'Dubai Branch - UAE',
      addressAr: 'شارع الشيخ زايد - وسط مدينة دبي - دبي',
      addressEn: 'Sheikh Zayed Road - Downtown Dubai - Dubai',
      phone: '+97141234567',
      email: 'dubai@elwasl.com',
      hoursAr: '١٠:٠٠ ص - ١٠:٠٠ م',
      hoursEn: '10:00 AM - 10:00 PM',
      cx: 205,
      cy: 98,
      r: 3,
      class: 'map-dot'
    },
    {
      id: 'd4',
      nameAr: 'لندن - منفذ التوزيع الدولي',
      nameEn: 'London - International Distribution',
      addressAr: 'شارع إدجوير - وسط لندن - لندن',
      addressEn: 'Edgware Road - Central London - London',
      phone: '+442071234567',
      email: 'london@elwasl.com',
      hoursAr: '٩:٠٠ ص - ٨:٠٠ م',
      hoursEn: '9:00 AM - 8:00 PM',
      cx: 162,
      cy: 70,
      r: 3,
      class: 'map-dot'
    },
    {
      id: 'd5',
      nameAr: 'نيويورك - منفذ التوزيع الدولي',
      nameEn: 'New York - International Distribution',
      addressAr: 'الشارع الخامس - مانهاتن - نيويورك',
      addressEn: 'Fifth Avenue - Manhattan - NY',
      phone: '+12125550199',
      email: 'ny@elwasl.com',
      hoursAr: '٩:٠٠ ص - ٩:٠٠ م',
      hoursEn: '9:00 AM - 9:00 PM',
      cx: 120,
      cy: 110,
      r: 2.5,
      class: 'map-dot'
    }
  ];

  private readonly dataSubject = new BehaviorSubject<HomepageData>(this.loadInitialData());

  constructor() {}

  private loadInitialData(): HomepageData {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error reading homepage content from localStorage', e);
    }
    return {
      services: this.defaultServices,
      authorCount: 374,
      authors: this.defaultAuthors,
      distributors: this.defaultDistributors
    };
  }

  getHomepageData(): Observable<HomepageData> {
    return this.dataSubject.asObservable();
  }

  getCurrentHomepageData(): HomepageData {
    return this.dataSubject.getValue();
  }

  saveHomepageData(data: HomepageData): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      this.dataSubject.next(data);
    } catch (e) {
      console.error('Error saving homepage content to localStorage', e);
    }
  }

  resetToDefault(): void {
    const defaultData: HomepageData = {
      services: this.defaultServices,
      authorCount: 374,
      authors: this.defaultAuthors,
      distributors: this.defaultDistributors
    };
    this.saveHomepageData(defaultData);
  }
}
