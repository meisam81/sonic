import { Audio, AVPlaybackStatus } from 'expo-av';
import { AudioTrack, PlaybackState, PlaybackRate } from '../types/audio';

type StateListener = (state: PlaybackState) => void;

class AudioService {
  private sound: Audio.Sound | null = null;
  private listeners: Set<StateListener> = new Set();
  private state: PlaybackState = {
    currentTrack: null,
    isPlaying: false,
    position: 0,
    duration: 0,
    rate: 1.0,
    isLoaded: false,
    isBuffering: false,
    error: null,
  };
  private queue: AudioTrack[] = [];
  private queueIndex: number = -1;
  private positionUpdateInterval: ReturnType<typeof setInterval> | null = null;

  subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener({ ...this.state });
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit() {
    const snapshot = { ...this.state };
    this.listeners.forEach((fn) => fn(snapshot));
  }

  private updateState(partial: Partial<PlaybackState>) {
    this.state = { ...this.state, ...partial };
    this.emit();
  }

  private startPositionUpdates() {
    this.stopPositionUpdates();
    this.positionUpdateInterval = setInterval(async () => {
      if (!this.sound || !this.state.isPlaying) return;
      try {
        const status = await this.sound.getStatusAsync();
        if (status.isLoaded) {
          this.updateState({
            position: status.positionMillis,
            duration: status.durationMillis ?? this.state.duration,
            isBuffering: status.isBuffering,
          });
        }
      } catch {
        // sound may have been unloaded
      }
    }, 250);
  }

  private stopPositionUpdates() {
    if (this.positionUpdateInterval) {
      clearInterval(this.positionUpdateInterval);
      this.positionUpdateInterval = null;
    }
  }

  private onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    if (status.didJustFinish) {
      this.handleTrackEnd();
      return;
    }
    this.updateState({
      position: status.positionMillis,
      duration: status.durationMillis ?? this.state.duration,
      isPlaying: status.isPlaying,
      isBuffering: status.isBuffering,
    });
  };

  private async handleTrackEnd() {
    // Try next in queue
    if (this.queueIndex < this.queue.length - 1) {
      await this.skipNext();
    } else {
      // Loop back to start of queue
      this.updateState({ isPlaying: false, position: 0 });
      this.stopPositionUpdates();
    }
  }

  async loadTrack(track: AudioTrack): Promise<void> {
    try {
      this.updateState({ error: null, isLoaded: false, isBuffering: true });

      // Unload previous
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: track.uri },
        {
          shouldPlay: false,
          progressUpdateIntervalMillis: 500,
          rate: this.state.rate,
          shouldCorrectPitch: true,
        },
        this.onPlaybackStatusUpdate
      );

      this.sound = sound;
      const status = await sound.getStatusAsync();

      this.updateState({
        currentTrack: track,
        isLoaded: true,
        isBuffering: false,
        duration: status.isLoaded ? (status.durationMillis ?? 0) : 0,
        position: 0,
        isPlaying: false,
      });
    } catch (err: any) {
      this.updateState({
        error: `Failed to load: ${err.message}`,
        isLoaded: false,
        isBuffering: false,
      });
    }
  }

  async play(): Promise<void> {
    if (!this.sound || !this.state.isLoaded) return;
    try {
      await this.sound.playAsync();
      this.updateState({ isPlaying: true });
      this.startPositionUpdates();
    } catch (err: any) {
      this.updateState({ error: `Playback failed: ${err.message}` });
    }
  }

  async pause(): Promise<void> {
    if (!this.sound) return;
    try {
      await this.sound.pauseAsync();
      this.updateState({ isPlaying: false });
      this.stopPositionUpdates();
    } catch (err: any) {
      this.updateState({ error: `Pause failed: ${err.message}` });
    }
  }

  async togglePlayPause(): Promise<void> {
    if (this.state.isPlaying) {
      await this.pause();
    } else {
      await this.play();
    }
  }

  async seekTo(positionMs: number): Promise<void> {
    if (!this.sound || !this.state.isLoaded) return;
    const clamped = Math.max(0, Math.min(positionMs, this.state.duration));
    try {
      await this.sound.setPositionAsync(clamped);
      this.updateState({ position: clamped });
    } catch (err: any) {
      this.updateState({ error: `Seek failed: ${err.message}` });
    }
  }

  async skipForward(ms: number = 10000): Promise<void> {
    await this.seekTo(this.state.position + ms);
  }

  async skipBackward(ms: number = 10000): Promise<void> {
    await this.seekTo(this.state.position - ms);
  }

  async setRate(rate: PlaybackRate): Promise<void> {
    if (!this.sound) {
      this.updateState({ rate });
      return;
    }
    try {
      await this.sound.setRateAsync(rate, true);
      this.updateState({ rate });
    } catch (err: any) {
      this.updateState({ error: `Rate change failed: ${err.message}` });
    }
  }

  async playTrack(track: AudioTrack): Promise<void> {
    await this.loadTrack(track);
    await this.play();
  }

  setQueue(tracks: AudioTrack[], startIndex: number = 0) {
    this.queue = tracks;
    this.queueIndex = startIndex;
  }

  async skipNext(): Promise<void> {
    if (this.queueIndex < this.queue.length - 1) {
      this.queueIndex++;
      await this.playTrack(this.queue[this.queueIndex]);
    }
  }

  async skipPrevious(): Promise<void> {
    // If >3 seconds in, restart current track; otherwise go to previous
    if (this.state.position > 3000 && this.queueIndex >= 0) {
      await this.seekTo(0);
    } else if (this.queueIndex > 0) {
      this.queueIndex--;
      await this.playTrack(this.queue[this.queueIndex]);
    } else {
      await this.seekTo(0);
    }
  }

  async cleanup(): Promise<void> {
    this.stopPositionUpdates();
    if (this.sound) {
      await this.sound.unloadAsync();
      this.sound = null;
    }
    this.listeners.clear();
  }

  getState(): PlaybackState {
    return { ...this.state };
  }

  getQueue(): { tracks: AudioTrack[]; index: number } {
    return { tracks: [...this.queue], index: this.queueIndex };
  }
}

export const audioService = new AudioService();
