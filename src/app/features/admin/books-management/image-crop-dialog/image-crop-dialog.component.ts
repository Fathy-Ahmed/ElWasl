import { Component, Inject, OnInit, signal, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

@Component({
  selector: 'app-image-crop-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatSliderModule,
    MatIconModule,
    MatButtonToggleModule
  ],
  template: `
    <h2 mat-dialog-title class="dialog-title">
      {{ 'تعديل حجم وموضع الغلاف / Adjust Cover Crop & Position' }}
    </h2>

    <mat-dialog-content class="crop-dialog-content">
      <p class="instructions">
        {{ 'اسحب الصورة لتحريكها واستخدم الشريط بالأسفل لتكبيرها أو تصغيرها / Drag the image to move it and use the slider to zoom in or out.' }}
      </p>

      <!-- Aspect Ratio Selectors -->
      <div class="ratio-selector-container">
        <span class="ratio-label">{{ 'نسبة الأبعاد / Aspect Ratio:' }}</span>
        <mat-button-toggle-group [value]="selectedRatio" (change)="onRatioChange($event.value)" aria-label="Aspect Ratio">
          <mat-button-toggle value="2:3">{{ '2:3 غلاف كتاب / Cover' }}</mat-button-toggle>
          <mat-button-toggle value="1:1">{{ '1:1 مربع / Square' }}</mat-button-toggle>
          <mat-button-toggle value="4:3">{{ '4:3 عريض / Wide' }}</mat-button-toggle>
          <mat-button-toggle value="original">{{ 'أبعاد الصورة / Original' }}</mat-button-toggle>
        </mat-button-toggle-group>
      </div>

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

        <!-- Dynamic dark overlays surrounding the viewport box -->
        <div class="overlay-dark" [style.top.px]="0" [style.left.px]="0" [style.right.px]="0" [style.height.px]="viewportTop"></div>
        <div class="overlay-dark" [style.bottom.px]="0" [style.left.px]="0" [style.right.px]="0" [style.height.px]="440 - viewportTop - viewportHeight"></div>
        <div class="overlay-dark" [style.top.px]="viewportTop" [style.bottom.px]="440 - viewportTop - viewportHeight" [style.left.px]="0" [style.width.px]="viewportLeft"></div>
        <div class="overlay-dark" [style.top.px]="viewportTop" [style.bottom.px]="440 - viewportTop - viewportHeight" [style.right.px]="0" [style.width.px]="320 - viewportLeft - viewportWidth"></div>

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
                    [step]="0.005">
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
      max-height: 80vh;
    }
    .instructions {
      font-size: 0.85rem;
      color: #666;
      text-align: center;
      margin: 0;
    }
    .ratio-selector-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      margin-bottom: 4px;
      width: 100%;
    }
    .ratio-label {
      font-size: 0.8rem;
      font-weight: bold;
      color: #555;
    }
    ::v-deep .mat-button-toggle-group {
      border: 1px solid rgba(212, 160, 23, 0.2) !important;
      background: white;
    }
    ::v-deep .mat-button-toggle {
      font-size: 0.78rem;
      font-weight: 600;
    }
    ::v-deep .mat-button-toggle-checked {
      background-color: #f57c00 !important;
      color: white !important;
    }
    .crop-area-container {
      position: relative;
      width: 320px;
      height: 440px;
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
      max-width: none;
      max-height: none;
      transform: translate(-50%, -50%);
    }
    
    .crop-viewport-outline {
      position: absolute;
      border: 2px solid #f57c00;
      box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.4), 0 4px 20px rgba(0,0,0,0.5);
      pointer-events: none;
      z-index: 10;
      border-radius: 4px;
      transition: width 0.2s ease, height 0.2s ease, left 0.2s ease, top 0.2s ease;
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

    .overlay-dark {
      position: absolute;
      background-color: rgba(0, 0, 0, 0.7);
      pointer-events: none;
      z-index: 5;
      transition: width 0.2s ease, height 0.2s ease, left 0.2s ease, top 0.2s ease, bottom 0.2s ease, right 0.2s ease;
    }

    .controls-row {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      max-width: 320px;
      margin-top: 4px;
    }
    .zoom-slider {
      flex: 1;
    }
    .dialog-actions {
      padding: 12px 24px;
      border-top: 1px solid #eee;
    }
  `]
})
export class ImageCropDialogComponent implements OnInit {
  @ViewChild('cropImage') cropImageRef!: ElementRef<HTMLImageElement>;

  imageUrl = '';
  imageLoaded = false;
  selectedRatio = '2:3';

  // Render & crop state
  minScale = 0.02;
  maxScale = 4.0;
  scale = 1.0;
  panX = 0;
  panY = 0;

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
      this.imageUrl = URL.createObjectURL(this.data.imageFile);
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

    // Viewport width and height
    const Vw = this.viewportWidth;
    const Vh = this.viewportHeight;

    const aspectViewport = Vw / Vh;
    const aspectImg = this.naturalWidth / this.naturalHeight;

    // Set initial scale to contain the full image inside the viewport box
    if (aspectImg > aspectViewport) {
      // Image is wider -> fit width
      this.scale = Vw / this.naturalWidth;
    } else {
      // Image is taller -> fit height
      this.scale = Vh / this.naturalHeight;
    }

    // Set min scale to 0.05 to allow complete zoom out so they can see the full image
    this.minScale = Math.min(this.scale * 0.25, 0.05);
    this.maxScale = this.scale * 5;
    this.panX = 0;
    this.panY = 0;
  }

  // Dynamic Viewport calculations
  get viewportWidth(): number {
    if (!this.imageLoaded) return 200;

    switch (this.selectedRatio) {
      case '1:1': return 250;
      case '4:3': return 260;
      case 'original':
        const aspect = this.naturalWidth / this.naturalHeight;
        if (aspect > 320/440) {
          // landscape or moderately portrait -> fit width
          return 270;
        } else {
          // extremely portrait -> fit height bounds
          return 380 * aspect;
        }
      case '2:3':
      default:
        return 200;
    }
  }

  get viewportHeight(): number {
    if (!this.imageLoaded) return 300;

    switch (this.selectedRatio) {
      case '1:1': return 250;
      case '4:3': return 195;
      case 'original':
        const aspect = this.naturalWidth / this.naturalHeight;
        if (aspect > 320/440) {
          return 270 / aspect;
        } else {
          return 380;
        }
      case '2:3':
      default:
        return 300;
    }
  }

  get viewportLeft(): number {
    return (320 - this.viewportWidth) / 2;
  }

  get viewportTop(): number {
    return (440 - this.viewportHeight) / 2;
  }

  getRatioLabel(): string {
    switch (this.selectedRatio) {
      case '1:1': return '1:1 مربع / Square';
      case '4:3': return '4:3 عريض / Wide';
      case 'original': return 'الأصلية / Original';
      case '2:3':
      default:
        return '2:3 غلاف كتاب / Cover';
    }
  }

  onRatioChange(ratio: string): void {
    this.selectedRatio = ratio;
    this.resetZoomAndFit();
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
