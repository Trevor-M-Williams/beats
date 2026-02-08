"use client";

import { useEffect, useRef, useState } from "react";

import type { Grid, TrackId } from "@/types";

import { STEPS } from "./constants";

type UseDrumAudioOptions = {
  grid: Grid;
  tempo: number;
};

export function useDrumAudio({ grid, tempo }: UseDrumAudioOptions) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const nextNoteTimeRef = useRef(0);
  const currentStepRef = useRef(0);
  const schedulerRef = useRef<number | null>(null);
  const openHatRef = useRef<{
    source: AudioBufferSourceNode;
    gain: GainNode;
  } | null>(null);

  const gridRef = useRef<Grid>(grid);
  const tempoRef = useRef(tempo);

  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);

  useEffect(() => {
    tempoRef.current = tempo;
  }, [tempo]);

  useEffect(() => {
    return () => {
      if (schedulerRef.current) {
        window.clearInterval(schedulerRef.current);
      }
      audioContextRef.current?.close();
    };
  }, []);

  const ensureAudio = async () => {
    if (!audioContextRef.current) {
      const context = new AudioContext();
      const masterGain = context.createGain();
      masterGain.gain.value = 0.85;
      masterGain.connect(context.destination);
      audioContextRef.current = context;
      masterGainRef.current = masterGain;
    }

    if (audioContextRef.current.state === "suspended") {
      await audioContextRef.current.resume();
    }
  };

  const createNoiseBuffer = () => {
    const context = audioContextRef.current;
    if (!context) return null;
    const buffer = context.createBuffer(
      1,
      context.sampleRate,
      context.sampleRate,
    );
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  };

  const createNoiseSource = () => {
    const context = audioContextRef.current;
    if (!context) return null;
    const buffer = createNoiseBuffer();
    if (!buffer) return null;
    const source = context.createBufferSource();
    source.buffer = buffer;
    return source;
  };

  const applyShortEnvelope = (
    gain: GainNode,
    time: number,
    peak: number,
    decay: number,
  ) => {
    gain.gain.setValueAtTime(peak, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + decay);
  };

  const playKick = (time: number) => {
    const context = audioContextRef.current;
    const master = masterGainRef.current;
    if (!context || !master) return;

    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(120, time);
    osc.frequency.exponentialRampToValueAtTime(45, time + 0.15);
    gain.gain.setValueAtTime(1, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
    osc.connect(gain);
    gain.connect(master);
    osc.start(time);
    osc.stop(time + 0.21);
  };

  const playSnare = (time: number) => {
    const context = audioContextRef.current;
    const master = masterGainRef.current;
    if (!context || !master) return;

    const noise = createNoiseSource();
    if (!noise) return;
    const noiseFilter = context.createBiquadFilter();
    noiseFilter.type = "highpass";
    noiseFilter.frequency.value = 1200;
    const noiseGain = context.createGain();
    applyShortEnvelope(noiseGain, time, 0.7, 0.15);

    const osc = context.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(180, time);
    const oscGain = context.createGain();
    applyShortEnvelope(oscGain, time, 0.4, 0.1);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(master);

    osc.connect(oscGain);
    oscGain.connect(master);

    noise.start(time);
    noise.stop(time + 0.2);
    osc.start(time);
    osc.stop(time + 0.2);
  };

  const playClap = (time: number) => {
    const context = audioContextRef.current;
    const master = masterGainRef.current;
    if (!context || !master) return;

    const noise = createNoiseSource();
    if (!noise) return;

    const bandpass = context.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.value = 2000;
    const highpass = context.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.value = 1200;
    const gain = context.createGain();

    applyShortEnvelope(gain, time, 0.8, 0.18);

    noise.connect(bandpass);
    bandpass.connect(highpass);
    highpass.connect(gain);
    gain.connect(master);

    noise.start(time);
    noise.stop(time + 0.22);
  };

  const playTom = (time: number) => {
    const context = audioContextRef.current;
    const master = masterGainRef.current;
    if (!context || !master) return;

    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(180, time);
    osc.frequency.exponentialRampToValueAtTime(90, time + 0.2);
    applyShortEnvelope(gain, time, 0.7, 0.22);
    osc.connect(gain);
    gain.connect(master);
    osc.start(time);
    osc.stop(time + 0.25);
  };

  const playRim = (time: number) => {
    const context = audioContextRef.current;
    const master = masterGainRef.current;
    if (!context || !master) return;

    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(800, time);
    applyShortEnvelope(gain, time, 0.5, 0.05);
    osc.connect(gain);
    gain.connect(master);
    osc.start(time);
    osc.stop(time + 0.07);
  };

  const playPerc = (time: number) => {
    const context = audioContextRef.current;
    const master = masterGainRef.current;
    if (!context || !master) return;

    const noise = createNoiseSource();
    if (!noise) return;

    const bandpass = context.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.value = 1200;
    const gain = context.createGain();
    applyShortEnvelope(gain, time, 0.4, 0.1);
    noise.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(master);
    noise.start(time);
    noise.stop(time + 0.12);
  };

  const stopOpenHat = (time: number) => {
    const openHat = openHatRef.current;
    if (!openHat) return;
    openHat.gain.gain.cancelScheduledValues(time);
    openHat.gain.gain.setValueAtTime(openHat.gain.gain.value, time);
    openHat.gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
    openHat.source.stop(time + 0.04);
    openHatRef.current = null;
  };

  const playClosedHat = (time: number) => {
    const context = audioContextRef.current;
    const master = masterGainRef.current;
    if (!context || !master) return;

    stopOpenHat(time);

    const noise = createNoiseSource();
    if (!noise) return;

    const bandpass = context.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.value = 9000;
    const highpass = context.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.value = 7000;
    const gain = context.createGain();
    applyShortEnvelope(gain, time, 0.3, 0.05);

    noise.connect(bandpass);
    bandpass.connect(highpass);
    highpass.connect(gain);
    gain.connect(master);

    noise.start(time);
    noise.stop(time + 0.06);
  };

  const playOpenHat = (time: number) => {
    const context = audioContextRef.current;
    const master = masterGainRef.current;
    if (!context || !master) return;

    const noise = createNoiseSource();
    if (!noise) return;

    const bandpass = context.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.value = 8500;
    const highpass = context.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.value = 6000;
    const gain = context.createGain();
    applyShortEnvelope(gain, time, 0.25, 0.22);

    noise.connect(bandpass);
    bandpass.connect(highpass);
    highpass.connect(gain);
    gain.connect(master);

    noise.start(time);
    noise.stop(time + 0.25);

    openHatRef.current = { source: noise, gain };
  };

  const triggerTrack = async (trackId: TrackId) => {
    await ensureAudio();
    const context = audioContextRef.current;
    if (!context) return;
    const time = context.currentTime + 0.01;
    switch (trackId) {
      case "kick":
        playKick(time);
        break;
      case "snare":
        playSnare(time);
        break;
      case "clap":
        playClap(time);
        break;
      case "tom":
        playTom(time);
        break;
      case "rim":
        playRim(time);
        break;
      case "perc":
        playPerc(time);
        break;
      case "hatClosed":
        playClosedHat(time);
        break;
      case "hatOpen":
        playOpenHat(time);
        break;
      default:
        break;
    }
  };

  const scheduleStep = (step: number, time: number) => {
    const pattern = gridRef.current;
    if (pattern[0]?.[step]) playKick(time);
    if (pattern[1]?.[step]) playSnare(time);
    if (pattern[2]?.[step]) playClap(time);
    if (pattern[3]?.[step]) playTom(time);
    if (pattern[4]?.[step]) playRim(time);
    if (pattern[5]?.[step]) playPerc(time);
    if (pattern[6]?.[step]) playClosedHat(time);
    if (pattern[7]?.[step]) playOpenHat(time);
  };

  const advanceStep = () => {
    const secondsPerBeat = 60 / tempoRef.current;
    nextNoteTimeRef.current += 0.25 * secondsPerBeat;
    currentStepRef.current = (currentStepRef.current + 1) % STEPS;
    setCurrentStep(currentStepRef.current);
  };

  const scheduler = () => {
    const context = audioContextRef.current;
    if (!context) return;
    while (nextNoteTimeRef.current < context.currentTime + 0.1) {
      scheduleStep(currentStepRef.current, nextNoteTimeRef.current);
      advanceStep();
    }
  };

  const start = async () => {
    await ensureAudio();
    if (!audioContextRef.current) return;
    nextNoteTimeRef.current = audioContextRef.current.currentTime + 0.05;
    currentStepRef.current = 0;
    setCurrentStep(0);
    if (schedulerRef.current) {
      window.clearInterval(schedulerRef.current);
    }
    schedulerRef.current = window.setInterval(scheduler, 25);
    setIsPlaying(true);
  };

  const stop = () => {
    if (schedulerRef.current) {
      window.clearInterval(schedulerRef.current);
      schedulerRef.current = null;
    }
    setIsPlaying(false);
  };

  return {
    currentStep,
    isPlaying,
    start,
    stop,
    triggerTrack,
  };
}
