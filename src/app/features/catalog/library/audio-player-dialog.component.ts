import { Component, Inject, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { TranslateModule } from '@ngx-translate/core';
import { LocalizedTextPipe } from '../../../shared/pipes/localized-text.pipe';
import { LocaleService } from '../../../core/i18n/locale.service';

@Component({
  selector: 'app-audio-player-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatSliderModule,
    TranslateModule,
    LocalizedTextPipe
  ],
  template: `
    <div class="audio-player-container" [dir]="localeService.isRtl() ? 'rtl' : 'ltr'">
      <div class="player-header">
        <h3>مشغل الكتب الصوتية / Audio Player</h3>
        <button mat-icon-button (click)="close()" class="close-btn">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="player-body">
        <!-- Rotating Cover Mockup -->
        <div class="album-art-wrapper">
          <div class="album-art" [class.playing]="isPlaying()">
            <img [src]="data.coverImage" [alt]="data | localizedText:'title'">
            <div class="vinyl-center"></div>
          </div>
        </div>

        <!-- Book Meta -->
        <div class="track-info">
          <h4 class="track-title">{{ data | localizedText:'title' }}</h4>
          <p class="track-narrator"><mat-icon>record_voice_over</mat-icon> {{ data.authorEn || 'Dar ElWasl Narrator' }}</p>
        </div>

        <!-- Waveform Animation -->
        <div class="waveform" [class.active]="isPlaying()">
          <span class="bar bar-1"></span>
          <span class="bar bar-2"></span>
          <span class="bar bar-3"></span>
          <span class="bar bar-4"></span>
          <span class="bar bar-5"></span>
          <span class="bar bar-6"></span>
          <span class="bar bar-7"></span>
          <span class="bar bar-8"></span>
          <span class="bar bar-9"></span>
        </div>

        <!-- Progress Timeline -->
        <div class="player-timeline">
          <span class="current-time">{{ formatTime(currentTime()) }}</span>
          <div class="slider-wrapper">
            <input type="range" class="progress-bar-slider" 
                   [value]="currentTime()" 
                   [max]="duration()" 
                   (input)="onProgressChange($event)" />
          </div>
          <span class="total-time">{{ formatTime(duration()) }}</span>
        </div>

        <!-- Playback Controls -->
        <div class="playback-controls">
          <button mat-icon-button class="skip-btn" (click)="skip(-10)" title="Rewind 10s">
            <mat-icon>replay_10</mat-icon>
          </button>
          
          <button mat-fab color="primary" class="play-btn" (click)="togglePlay()">
            <mat-icon>{{ isPlaying() ? 'pause' : 'play_arrow' }}</mat-icon>
          </button>
          
          <button mat-icon-button class="skip-btn" (click)="skip(10)" title="Forward 10s">
            <mat-icon>forward_10</mat-icon>
          </button>
        </div>

        <!-- Volume Row -->
        <div class="volume-control-row">
          <mat-icon>volume_down</mat-icon>
          <div class="slider-wrapper volume-slider">
            <input type="range" class="progress-bar-slider volume-bar" 
                   [value]="volume()" 
                   max="100" 
                   (input)="onVolumeChange($event)" />
          </div>
          <mat-icon>volume_up</mat-icon>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .audio-player-container {
      padding: 1rem;
      background: linear-gradient(135deg, #FFFDF6 0%, #FFF8EA 100%);
      border-radius: 12px;
      color: #3e2723;
    }
    .player-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(212, 160, 23, 0.15);
      padding-bottom: 8px;
      h3 {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 800;
        color: #F57C00;
      }
      .close-btn { color: #8d6e63; }
    }
    .player-body {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 1.5rem;
      gap: 1.25rem;
    }
    .album-art-wrapper {
      position: relative;
      width: 160px;
      height: 160px;
      margin-bottom: 0.5rem;
    }
    .album-art {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      overflow: hidden;
      border: 6px solid #3e2723;
      box-shadow: 0 8px 24px rgba(0,0,0,0.18);
      position: relative;
      transition: transform 0.5s ease;
      animation: rotateVinyl 20s linear infinite;
      animation-play-state: paused;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      &.playing {
        animation-play-state: running;
      }
    }
    .vinyl-center {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 32px;
      height: 32px;
      background-color: #FFFDF6;
      border: 3px solid #3e2723;
      border-radius: 50%;
      box-shadow: inset 0 0 5px rgba(0,0,0,0.2);
    }
    @keyframes rotateVinyl {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .track-info {
      text-align: center;
      .track-title {
        margin: 0 0 6px 0;
        font-size: 1.15rem;
        font-weight: 800;
        color: #3e2723;
      }
      .track-narrator {
        margin: 0;
        font-size: 0.9rem;
        color: #795548;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
        }
      }
    }
    .waveform {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 3px;
      height: 28px;
      width: 100%;
      
      .bar {
        width: 3px;
        height: 4px;
        background-color: #D4A017;
        border-radius: 2px;
        transition: height 0.2s ease;
      }
      
      &.active {
        .bar {
          animation: wave 1.2s ease-in-out infinite alternate;
          
          &-1 { animation-delay: 0.1s; }
          &-2 { animation-delay: 0.3s; }
          &-3 { animation-delay: 0.5s; }
          &-4 { animation-delay: 0.2s; }
          &-5 { animation-delay: 0.4s; }
          &-6 { animation-delay: 0.6s; }
          &-7 { animation-delay: 0.1s; }
          &-8 { animation-delay: 0.3s; }
          &-9 { animation-delay: 0.5s; }
        }
      }
    }
    @keyframes wave {
      from { height: 4px; }
      to { height: 28px; }
    }
    .player-timeline {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      gap: 12px;
      font-size: 0.85rem;
      font-weight: bold;
      color: #795548;
    }
    .slider-wrapper {
      flex-grow: 1;
      display: flex;
      align-items: center;
    }
    .progress-bar-slider {
      width: 100%;
      accent-color: #F57C00;
      cursor: pointer;
    }
    .playback-controls {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      
      .play-btn {
        width: 56px;
        height: 56px;
        background-color: #F57C00 !important;
        color: white !important;
        mat-icon { font-size: 28px; width: 28px; height: 28px; }
      }
      
      .skip-btn { color: #5d4037; }
    }
    .volume-control-row {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 80%;
      color: #795548;
      
      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }
    .volume-slider {
      .volume-bar {
        accent-color: #795548;
      }
    }
  `]
})
export class AudioPlayerDialogComponent {
  readonly localeService = inject(LocaleService);

  readonly isPlaying = signal<boolean>(false);
  readonly currentTime = signal<number>(0);
  readonly duration = signal<number>(1800); // 30 minutes mock
  readonly volume = signal<number>(80);

  private timerInterval?: any;

  constructor(
    public dialogRef: MatDialogRef<AudioPlayerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  close(): void {
    this.stopTimer();
    this.dialogRef.close();
  }

  togglePlay(): void {
    const playing = !this.isPlaying();
    this.isPlaying.set(playing);
    if (playing) {
      this.startTimer();
    } else {
      this.stopTimer();
    }
  }

  skip(seconds: number): void {
    let t = this.currentTime() + seconds;
    if (t < 0) t = 0;
    if (t > this.duration()) t = this.duration();
    this.currentTime.set(t);
  }

  onProgressChange(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.currentTime.set(parseInt(val, 10));
  }

  onVolumeChange(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.volume.set(parseInt(val, 10));
  }

  formatTime(secs: number): string {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  private startTimer(): void {
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      let t = this.currentTime() + 1;
      if (t >= this.duration()) {
        t = 0;
        this.togglePlay();
      }
      this.currentTime.set(t);
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }
}
