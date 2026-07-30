import { Component, Inject, OnInit, signal, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';
import { MatIconModule } from '@angular/material/icon';

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
        {{ 'اسحب الصورة لتحريكها واستخدم الشريط بالأسفل لتكبيرها / Drag the image to position it and use the slider below to zoom.' }}
      </p>

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

        <!-- Overlays to darken the outside area -->
        <div class="overlay-dark overlay-top"></div>
        <div class="overlay-dark overlay-bottom"></div>
        <div class="overlay-dark overlay-left"></div>
        <div class="overlay-dark overlay-right"></div>

        <!-- Visual boundary of the 2:3 book cover viewport -->
        <div class="crop-viewport-outline">
          <div class="aspect-ratio-badge">2:3 {{ 'نسبة الغلاف / Cover Ratio' }}</div>
        </div>
      </div>

      <!-- Zoom Slider Controls -->
      <div class="controls-row">
        <mat-icon color="primary">zoom_out</mat-icon>
        <mat-slider class="zoom-slider" 
                    [min]="minScale" 
                    [max]="maxScale" 
                    [step]="0.01">
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
      gap: 16px;
      overflow: hidden !important;
    }
    .instructions {
      font-size: 0.9rem;
      color: #666;
      text-align: center;
      margin: 0;
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
    
    /* Center Book Cover Viewport layout (200px width x 300px height) */
    .crop-viewport-outline {
      position: absolute;
      top: 70px;
      left: 60px;
      width: 200px;
      height: 300px;
      border: 2px solid #f57c00;
      box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.4), 0 4px 20px rgba(0,0,0,0.5);
      pointer-events: none;
      z-index: 10;
      border-radius: 4px;
    }
    .aspect-ratio-badge {
      position: absolute;
      top: -24px;
      right: 0;
      background-color: #f57c00;
      color: white;
      font-size: 0.75rem;
      font-weight: bold;
      padding: 2px 8px;
      border-radius: 4px;
    }

    /* Dark overlays outside the 2:3 crop viewport */
    .overlay-dark {
      position: absolute;
      background-color: rgba(0, 0, 0, 0.7);
      pointer-events: none;
      z-index: 5;
    }
    .overlay-top {
      top: 0;
      left: 0;
      right: 0;
      height: 70px;
    }
    .overlay-bottom {
      bottom: 0;
      left: 0;
      right: 0;
      height: 70px;
    }
    .overlay-left {
      top: 70px;
      bottom: 70px;
      left: 0;
      width: 60px;
    }
    .overlay-right {
      top: 70px;
      bottom: 70px;
      right: 0;
      width: 60px;
    }

    .controls-row {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      max-width: 320px;
      margin-top: 8px;
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

  // Render & crop state
  minScale = 0.1;
  maxScale = 3.0;
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
  private naturalWidth = 0;
  private naturalHeight = 0;

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

    // Viewport is 200 x 300 centered in 320 x 440 container.
    // Calculate initial scale to fit viewport beautifully
    const aspectViewport = 200 / 300;
    const aspectImg = this.naturalWidth / this.naturalHeight;

    if (aspectImg > aspectViewport) {
      // Image is wider than viewport -> fit height to 300px
      this.scale = 300 / this.naturalHeight;
    } else {
      // Image is taller than viewport -> fit width to 200px
      this.scale = 200 / this.naturalWidth;
    }

    this.minScale = this.scale;
    this.maxScale = this.scale * 4;
    this.imageLoaded = true;
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

    // Create high-res crop canvas (600px width x 900px height for sharp cover)
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 900;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const img = this.cropImageRef.nativeElement;

    // We mapped:
    // Viewport box in UI is 200 width, 300 height.
    // Canvas output is 600 width, 900 height -> scale factor is 3.0.
    const drawScale = 3.0;

    ctx.save();
    // Move canvas center to the output center
    ctx.translate(300, 450);
    // Apply pan and zoom factor scaled up to high-res canvas
    ctx.translate(this.panX * drawScale, this.panY * drawScale);
    ctx.scale(this.scale * drawScale, this.scale * drawScale);
    // Draw the image centered around transformed canvas context
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
