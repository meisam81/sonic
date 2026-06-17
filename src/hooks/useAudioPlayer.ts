import { useState, useEffect, useCallback } from 'react';
import { audioService } from '../services/audio-service';
import { PlaybackState, PlaybackRate } from '../types/audio';

export function useAudioPlayer() {
  const [state, setState] = useState<PlaybackState>(audioService.getState());

  useEffect(() => {
    const unsubscribe = audioService.subscribe(setState);
    return unsubscribe;
  }, []);

  const play = useCallback(() => audioService.play(), []);
  const pause = useCallback(() => audioService.pause(), []);
  const togglePlayPause = useCallback(() => audioService.togglePlayPause(), []);
  const seekTo = useCallback((ms: number) => audioService.seekTo(ms), []);
  const skipForward = useCallback((ms?: number) => audioService.skipForward(ms), []);
  const skipBackward = useCallback((ms?: number) => audioService.skipBackward(ms), []);
  const setRate = useCallback((rate: PlaybackRate) => audioService.setRate(rate), []);
  const skipNext = useCallback(() => audioService.skipNext(), []);
  const skipPrevious = useCallback(() => audioService.skipPrevious(), []);

  return {
    ...state,
    play,
    pause,
    togglePlayPause,
    seekTo,
    skipForward,
    skipBackward,
    setRate,
    skipNext,
    skipPrevious,
  };
}
