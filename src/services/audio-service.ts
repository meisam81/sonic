import { createAudioPlayer, AudioSource, useAudioPlayer } from 'expo-audio';
import type { AudioPlayer, AudioStatus } from 'expo-audio';
import { AudioTrack, PlaybackState, PlaybackRate } from '../types/audio';

type StateListener = (state: PlaybackState) => void;

class AudioService {
  private player: AudioPlayer | null = null;
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
  private pollInterval: ReturnType<typeof setInterval> | null = null;

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

  private startPolling() {
    this.stopPolling();
    this.pollInterval = setInterval(() => {
      if (!this.player) return;
      this.updateState({
        position: this.player.currentTime * 1000,
        duration: this.player.duration * 1000,
        isBuffering: this.player.isBuffering,
        isPlaying: this.player.playing,
      });
    }, 250);
  }

  private stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  private buildSource(track: AudioTrack): AudioSource {
    return { uri: track.uri };
  }

  async loadTrack(track: AudioTrack): Promise<void> {
    try {
      this.updateState({ error: null, isLoaded: false, isBuffering: true });

      if (this.player) {
        this.player.remove();
        this.player = null;
      }

      this.player = createAudioPlayer(this.buildSource(track), { updateInterval: 250 });

      this.player.addListener('playbackStatusUpdate', (status: AudioStatus) => {
        this.updateState({
          position: status.currentTime * 1000,
          duration: status.duration * 1000,
          isPlaying: status.playing,
          isBuffering: status.isBuffering,
        });
        if (status.didJustFinish) {
          this.handleTrackEnd();
        }
      });

      this.player.playbackRate = this.state.rate;
      this.player.shouldCorrectPitch = true;

      this.updateState({
        currentTrack: track,
        isLoaded: true,
        isBuffering: false,
        duration: (this.player.duration ?? 0) * 1000,
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
    if (!this.player || !this.state.isLoaded) return;
    try {
      this.player.play();
      this.updateState({ isPlaying: true });
      this.startPolling();
    } catch (err: any) {
      this.updateState({ error: `Playback failed: ${err.message}` });
    }
  }

  async pause(): Promise<void> {
    if (!this.player) return;
    try {
      this.player.pause();
      this.updateState({ isPlaying: false });
      this.stopPolling();
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
    if (!this.player || !this.state.isLoaded) return;
    const clamped = Math.max(0, Math.min(positionMs, this.state.duration));
    try {
      await this.player.seekTo(clamped / 1000);
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
    if (!this.player) {
      this.updateState({ rate });
      return;
    }
    try {
      this.player.playbackRate = rate;
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

  private async handleTrackEnd() {
    if (this.queueIndex < this.queue.length - 1) {
      await this.skipNext();
    } else {
      this.updateState({ isPlaying: false, position: 0 });
      this.stopPolling();
    }
  }

  async skipNext(): Promise<void> {
    if (this.queueIndex < this.queue.length - 1) {
      this.queueIndex++;
      await this.playTrack(this.queue[this.queueIndex]);
    }
  }

  async skipPrevious(): Promise<void> {
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
    this.stopPolling();
    if (this.player) {
      this.player.remove();
      this.player = null;
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

export { useAudioPlayer };
