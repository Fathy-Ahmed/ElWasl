import { Component, Inject, OnInit, signal, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-image-crop-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatSliderModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title class="dialog-title">
      {{ 'تعديل حجم وموضع الغلاف / Adjust Cover Crop & Position' }}
    </h2>

    <mat-dialog-content class="crop-dialog-content">
      <p class="instructions">
        {{ 'اسحب الصورة لتحريكها واستخدم الشريط بالأسفل لتكبيرها أو تصغيرها / Drag the image to move it and use the slider to zoom in or out.' }}
      </p>

      <!-- Aspect Ratio & Dimensions Control -->
      <div class="controls-card">
        <div class="control-group">
          <label class="control-label">{{ 'نسبة الأبعاد / Aspect Ratio:' }}</label>
          <select class="ratio-select" [value]="selectedRatio" (change)="onRatioSelect($event)">
            <option value="2:3">2:3 غلاف كتاب / Book Cover</option>
            <option value="1:1">1:1 مربع / Square</option>
            <option value="4:3">4:3 عريض / Wide</option>
            <option value="original">أبعاد الصورة الأصلية / Original Ratio</option>
            <option value="free">قص حر (تحديد يدوي) / Free Crop (Manual Dimensions)</option>
          </select>
        </div>

        <!-- Manual dimensions sliders for Free Crop option (bounded to 260px to fit in container) -->
        @if (selectedRatio === 'free') {
          <div class="free-dims-container animate-fade-in">
            <div class="dim-control">
              <span class="dim-label">العرض / Width: <strong>{{ freeWidth }}px</strong></span>
              <mat-slider min="60" max="260" step="5" class="dim-slider">
                <input matSliderThumb [value]="freeWidth" (input)="onFreeWidthChange($event)">
              </mat-slider>
            </div>
            <div class="dim-control">
              <span class="dim-label">الارتفاع / Height: <strong>{{ freeHeight }}px</strong></span>
              <mat-slider min="60" max="260" step="5" class="dim-slider">
                <input matSliderThumb [value]="freeHeight" (input)="onFreeHeightChange($event)">
              </mat-slider>
            </div>
          </div>
        }
      </div>

      <!-- Main Image Crop Area Container (Sized to 300x300 for 100% screen visibility) -->
      <div class="crop-area-container" 
           (mousedown)="onMouseDown($event)"
           (mousemove)="onMouseMove($event)"
           (mouseup)="onMouseUp()"
           (mouseleave)="onMouseUp()"
           (touchstart)="onTouchStart($event)"
           (touchmove)="onTouchMove($event)"
           (touchend)="onTouchEnd()">
        
        <!-- Viewport container showing the image -->
        <div class="image-wrapper" [style.transform]="getTransformStyle()">
          <img [src]="imageUrl" (load)="onImageLoaded($event)" #cropImage alt="Crop Source" class="source-img">
        </div>

        <!-- Light semi-transparent overlays centered on 300x300 container -->
        <div class="overlay-light" [style.top.px]="0" [style.left.px]="0" [style.right.px]="0" [style.height.px]="viewportTop"></div>
        <div class="overlay-light" [style.bottom.px]="0" [style.left.px]="0" [style.right.px]="0" [style.height.px]="300 - viewportTop - viewportHeight"></div>
        <div class="overlay-light" [style.top.px]="viewportTop" [style.bottom.px]="300 - viewportTop - viewportHeight" [style.left.px]="0" [style.width.px]="viewportLeft"></div>
        <div class="overlay-light" [style.top.px]="viewportTop" [style.bottom.px]="300 - viewportTop - viewportHeight" [style.right.px]="0" [style.width.px]="300 - viewportLeft - viewportWidth"></div>

        <!-- Visual boundary of the crop viewport -->
        <div class="crop-viewport-outline" 
             [style.width.px]="viewportWidth" 
             [style.height.px]="viewportHeight"
             [style.left.px]="viewportLeft"
             [style.top.px]="viewportTop">
          <div class="aspect-ratio-badge">{{ getRatioLabel() }}</div>
        </div>
      </div>

      <!-- Zoom Slider Controls -->
      <div class="controls-row">
        <mat-icon color="primary">zoom_out</mat-icon>
        <mat-slider class="zoom-slider" 
                    [min]="minScale" 
                    [max]="maxScale" 
                    [step]="0.002">
          <input matSliderThumb [value]="scale" (input)="onZoomChange($event)">
        </mat-slider>
        <mat-icon color="primary">zoom_in</mat-icon>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="dialog-actions">
      <button mat-button (click)="cancel()">{{ 'إلغاء / Cancel' }}</button>
      <button mat-raised-button color="primary" [disabled]="!imageLoaded" (click)="cropAndSave()">
        <mat-icon>crop</mat-icon>
        {{ 'قص وحفظ / Crop & Save' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-title {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-weight: bold;
      text-align: center;
      color: #3e2723;
    }
    .crop-dialog-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      overflow-y: auto !important;
      max-height: 82vh;
      padding: 10px 16px;
    }
    .instructions {
      font-size: 0.8rem;
      color: #666;
      text-align: center;
      margin: 0;
    }
    
    .controls-card {
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 100%;
      max-width: 300px;
      padding: 10px;
      background: #fdfaf5;
      border: 1px solid rgba(212, 160, 23, 0.15);
      border-radius: 8px;
      flex-shrink: 0;
    }
    .control-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .control-label {
      font-size: 0.78rem;
      font-weight: 700;
      color: #555;
    }
    .ratio-select {
      width: 100%;
      height: 38px;
      border: 1px solid rgba(212, 160, 23, 0.3);
      border-radius: 6px;
      background: white;
      padding: 0 8px;
      font-size: 0.82rem;
      font-weight: 600;
      color: #3e2723;
      outline: none;
      cursor: pointer;
      transition: border-color 0.2s ease;
    }
    .ratio-select:focus {
      border-color: #f57c00;
    }

    .free-dims-container {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding-top: 4px;
      border-top: 1px dashed rgba(212, 160, 23, 0.2);
    }
    .dim-control {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .dim-label {
      font-size: 0.75rem;
      color: #666;
    }
    .dim-slider {
      height: 28px;
    }

    .crop-area-container {
      position: relative;
      width: 300px;
      height: 300px;
      flex-shrink: 0;
      background-color: #1a1a1a;
      overflow: hidden;
      border-radius: 8px;
      cursor: grab;
      user-select: none;
      touch-action: none;
      box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.6);
    }
    .crop-area-container:active {
      cursor: grabbing;
    }
    .image-wrapper {
      position: absolute;
      top: 50%;
      left: 50%;
      transform-origin: center center;
      pointer-events: none;
    }
    .source-img {
      display: block;
      max-width: none !important;
      max-height: none !important;
      width: auto !important;
      height: auto !important;
      transform: translate(-50%, -50%) !important;
    }
    
    .crop-viewport-outline {
      position: absolute;
      border: 2px solid #f57c00;
      box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.4), 0 4px 20px rgba(0,0,0,0.5);
      pointer-events: none;
      z-index: 10;
      border-radius: 4px;
      transition: width 0.15s ease, height 0.15s ease, left 0.15s ease, top 0.15s ease;
    }
    .aspect-ratio-badge {
      position: absolute;
      top: -24px;
      right: 0;
      background-color: #f57c00;
      color: white;
      font-size: 0.72rem;
      font-weight: bold;
      padding: 2px 8px;
      border-radius: 4px;
      white-space: nowrap;
    }

    .overlay-light {
      position: absolute;
      background-color: rgba(0, 0, 0, 0.35);
      pointer-events: none;
      z-index: 5;
      transition: width 0.15s ease, height 0.15s ease, left 0.15s ease, top 0.15s ease, bottom 0.15s ease, right 0.15s ease;
    }

    .controls-row {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      max-width: 300px;
      margin-top: 4px;
      flex-shrink: 0;
    }
    .zoom-slider {
      flex: 1;
    }
    .dialog-actions {
      padding: 12px 24px;
      border-top: 1px solid #eee;
    }
    .animate-fade-in {
      animation: fadeIn 0.2s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-5px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class ImageCropDialogComponent implements OnInit {
  @ViewChild('cropImage') cropImageRef!: ElementRef<HTMLImageElement>;

  private readonly sanitizer = inject(DomSanitizer);

  imageUrl: string | SafeUrl = '';
  imageLoaded = false;
  selectedRatio = '2:3';

  // Render & crop state
  minScale = 0.01;
  maxScale = 5.0;
  scale = 1.0;
  panX = 0;
  panY = 0;

  // Free crop dimensions (bounded to fit 300x300 container)
  freeWidth = 180;
  freeHeight = 240;

  // Interaction variables
  private isDragging = false;
  private startDragX = 0;
  private startDragY = 0;
  private initialPanX = 0;
  private initialPanY = 0;

  // Image natural bounds
  naturalWidth = 0;
  naturalHeight = 0;

  constructor(
    private readonly dialogRef: MatDialogRef<ImageCropDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { imageFile: File }
  ) {}

  ngOnInit(): void {
    if (this.data.imageFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (result) {
          this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(result as string);
        }
      };
      reader.readAsDataURL(this.data.imageFile);
    }
  }

  onImageLoaded(event: Event): void {
    const img = event.target as HTMLImageElement;
    this.naturalWidth = img.naturalWidth;
    this.naturalHeight = img.naturalHeight;
    this.imageLoaded = true;
    this.resetZoomAndFit();
  }

  resetZoomAndFit(): void {
    if (!this.imageLoaded) return;

    const Vw = this.viewportWidth;
    const Vh = this.viewportHeight;

    const aspectViewport = Vw / Vh;
    const aspectImg = this.naturalWidth / this.naturalHeight;

    // contain the full image inside the viewport box so it starts fully visible
    if (aspectImg > aspectViewport) {
      this.scale = Vw / this.naturalWidth;
    } else {
      this.scale = Vh / this.naturalHeight;
    }

    this.minScale = Math.min(this.scale * 0.2, 0.02);
    this.maxScale = this.scale * 6;
    this.panX = 0;
    this.panY = 0;
  }

  // Dynamic Viewport calculations inside 300x300 container
  get viewportWidth(): number {
    if (!this.imageLoaded) return 160;

    switch (this.selectedRatio) {
      case '1:1': return 220;
      case '4:3': return 240;
      case 'free': return this.freeWidth;
      case 'original':
        const aspect = this.naturalWidth / this.naturalHeight;
        if (aspect > 1) {
          // landscape -> fit width bounds
          return 240;
        } else {
          // portrait -> fit height bounds
          return 240 * aspect;
        }
      case '2:3':
      default:
        return 160;
    }
  }

  get viewportHeight(): number {
    if (!this.imageLoaded) return 240;

    switch (this.selectedRatio) {
      case '1:1': return 220;
      case '4:3': return 180;
      case 'free': return this.freeHeight;
      case 'original':
        const aspect = this.naturalWidth / this.naturalHeight;
        if (aspect > 1) {
          return 240 / aspect;
        } else {
          return 240;
        }
      case '2:3':
      default:
        return 240;
    }
  }

  get viewportLeft(): number {
    return (300 - this.viewportWidth) / 2;
  }

  get viewportTop(): number {
    return (300 - this.viewportHeight) / 2;
  }

  getRatioLabel(): string {
    switch (this.selectedRatio) {
      case '1:1': return '1:1 مربع / Square';
      case '4:3': return '4:3 عريض / Wide';
      case 'original': return 'الأصلية / Original';
      case 'free': return `قص حر / Free (${this.freeWidth}x${this.freeHeight})`;
      case '2:3':
      default:
        return '2:3 غلاف كتاب / Cover';
    }
  }

  onRatioChange(ratio: string): void {
    this.selectedRatio = ratio;
    this.resetZoomAndFit();
  }

  onRatioSelect(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedRatio = select.value;
    this.resetZoomAndFit();
  }

  onFreeWidthChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.freeWidth = Number(input.value);
  }

  onFreeHeightChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.freeHeight = Number(input.value);
  }

  getTransformStyle(): string {
    return `translate(${this.panX}px, ${this.panY}px) scale(${this.scale})`;
  }

  onZoomChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.scale = Number(input.value);
  }

  // Mouse drag handlers
  onMouseDown(event: MouseEvent): void {
    if (!this.imageLoaded) return;
    this.isDragging = true;
    this.startDragX = event.clientX;
    this.startDragY = event.clientY;
    this.initialPanX = this.panX;
    this.initialPanY = this.panY;
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.isDragging) return;
    const dx = event.clientX - this.startDragX;
    const dy = event.clientY - this.startDragY;
    this.panX = this.initialPanX + dx;
    this.panY = this.initialPanY + dy;
  }

  onMouseUp(): void {
    this.isDragging = false;
  }

  // Touch drag handlers (for mobile)
  onTouchStart(event: TouchEvent): void {
    if (!this.imageLoaded || event.touches.length === 0) return;
    this.isDragging = true;
    this.startDragX = event.touches[0].clientX;
    this.startDragY = event.touches[0].clientY;
    this.initialPanX = this.panX;
    this.initialPanY = this.panY;
  }

  onTouchMove(event: TouchEvent): void {
    if (!this.isDragging || event.touches.length === 0) return;
    const dx = event.touches[0].clientX - this.startDragX;
    const dy = event.touches[0].clientY - this.startDragY;
    this.panX = this.initialPanX + dx;
    this.panY = this.initialPanY + dy;
  }

  onTouchEnd(): void {
    this.isDragging = false;
  }

  cancel(): void {
    this.dialogRef.close(null);
  }

  cropAndSave(): void {
    if (!this.imageLoaded) return;

    const Vw = this.viewportWidth;
    const Vh = this.viewportHeight;

    // High-res output canvas matching the viewport aspect ratio
    const Cw = 600;
    const Ch = Math.round(Cw * (Vh / Vw));

    const canvas = document.createElement('canvas');
    canvas.width = Cw;
    canvas.height = Ch;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const img = this.cropImageRef.nativeElement;

    // Scale factor to map viewport pixels to output canvas
    const drawScale = Cw / Vw;

    ctx.save();
    // Center of canvas
    ctx.translate(Cw / 2, Ch / 2);
    // Apply pan and zoom
    ctx.translate(this.panX * drawScale, this.panY * drawScale);
    ctx.scale(this.scale * drawScale, this.scale * drawScale);
    // Draw centered
    ctx.drawImage(img, -this.naturalWidth / 2, -this.naturalHeight / 2);
    ctx.restore();

    canvas.toBlob((blob) => {
      if (blob) {
        const croppedFile = new File([blob], this.data.imageFile.name, {
          type: 'image/jpeg',
          lastModified: Date.now()
        });
        this.dialogRef.close(croppedFile);
      } else {
        this.dialogRef.close(null);
      }
    }, 'image/jpeg', 0.95);
  }
}
