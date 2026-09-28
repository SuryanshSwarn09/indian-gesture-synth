import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

// ---- DOM References ----
const videoEl = document.getElementById("webcam");
const canvasEl = document.getElementById("overlay");
const ctx = canvasEl.getContext("2d");

const modeSelectEl = document.getElementById("modeSelect");
const thaatGroupEl = document.getElementById("thaatGroup");
const thaatSelectEl = document.getElementById("thaatSelect");
const keySelectEl = document.getElementById("keySelect");
const tuningSelectEl = document.getElementById("tuningSelect");
const toneSelectEl = document.getElementById("toneSelect");

const tanpuraToggleEl = document.getElementById("tanpuraToggle");
const tanpuraStringSelectEl = document.getElementById("tanpuraStringSelect");
const tanpuraVolumeEl = document.getElementById("tanpuraVolume");

const guideToggleEl = document.getElementById("guideToggle");
const gestureGuideEl = document.getElementById("gestureGuide");
const guideContentEl = document.getElementById("guideContent");

const swaraDevanagariEl = document.getElementById("swaraDevanagari");
const chordDisplayEl = document.getElementById("chordDisplay");
const qualityDisplayEl = document.getElementById("qualityDisplay");
const saptakIndicatorEl = document.getElementById("saptakIndicator");

const volumeBarEls = Array.from(document.querySelectorAll(".vol-bar"));
const distortionDisplayEl = document.getElementById("distortionDisplay");
const startOverlayEl = document.getElementById("startOverlay");

const helpButton = document.getElementById("helpButton");
const helpModal = document.getElementById("helpModal");
const closeHelp = document.getElementById("closeHelp");

function trackClarityEvent(eventName) {
  if (typeof window.clarity === "function") {
    window.clarity("event", eventName);
  }
}

// ---- Indian Classical Music Definitions ----
const SWARAS = {
  S: { code: "S", hindi: "सा", name: "Sa", full: "Shadja", degree: 1, type: "achala" },
  r: { code: "r", hindi: "रे॒", name: "Komal Re", full: "Komal Rishabh", degree: 2, type: "komal" },
  R: { code: "R", hindi: "रे", name: "Shuddha Re", full: "Shuddha Rishabh", degree: 2, type: "shuddha" },
  g: { code: "g", hindi: "ग॒", name: "Komal Ga", full: "Komal Gandhar", degree: 3, type: "komal" },
  G: { code: "G", hindi: "ग", name: "Shuddha Ga", full: "Shuddha Gandhar", degree: 3, type: "shuddha" },
  m: { code: "m", hindi: "म", name: "Shuddha Ma", full: "Shuddha Madhyam", degree: 4, type: "shuddha" },
  M: { code: "M", hindi: "म॑", name: "Teevra Ma", full: "Teevra Madhyam", degree: 4, type: "teevra" },
  P: { code: "P", hindi: "प", name: "Pa", full: "Pancham", degree: 5, type: "achala" },
  d: { code: "d", hindi: "ध॒", name: "Komal Dha", full: "Komal Dhaivat", degree: 6, type: "komal" },
  D: { code: "D", hindi: "ध", name: "Shuddha Dha", full: "Shuddha Dhaivat", degree: 6, type: "shuddha" },
  n: { code: "n", hindi: "नि॒", name: "Komal Ni", full: "Komal Nishad", degree: 7, type: "komal" },
  N: { code: "N", hindi: "नि", name: "Shuddha Ni", full: "Shuddha Nishad", degree: 7, type: "shuddha" }
};

// 10 Parent Thaats (Hindustani)
const THAATS = {
  bilawal: { name: "Bilawal", hindi: "बिलावल", swaras: ["S", "R", "G", "m", "P", "D", "N"] },
  kalyan:  { name: "Kalyan / Yaman", hindi: "कल्याण", swaras: ["S", "R", "G", "M", "P", "D", "N"] },
  khamaj:  { name: "Khamaj", hindi: "खमाज", swaras: ["S", "R", "G", "m", "P", "D", "n"] },
  kafi:    { name: "Kafi", hindi: "काफ़ी", swaras: ["S", "R", "g", "m", "P", "D", "n"] },
  asavari: { name: "Asavari", hindi: "आसावरी", swaras: ["S", "R", "g", "m", "P", "d", "n"] },
  bhairav: { name: "Bhairav", hindi: "भैरव", swaras: ["S", "r", "G", "m", "P", "d", "N"] },
  bhairavi:{ name: "Bhairavi", hindi: "भैरवी", swaras: ["S", "r", "g", "m", "P", "d", "n"] },
  todi:    { name: "Todi", hindi: "तोड़ी", swaras: ["S", "r", "g", "M", "P", "d", "N"] },
  poorvi:  { name: "Poorvi", hindi: "पूर्वी", swaras: ["S", "r", "G", "M", "P", "d", "N"] },
  marwa:   { name: "Marwa", hindi: "मारवा", swaras: ["S", "r", "G", "M", "P", "D", "N"] }
};

// 22 Shrutis Just Intonation Ratios
const SHRUTI_RATIOS = {
  S: 1.0,
  r: 16 / 15,
  R: 9 / 8,
  g: 6 / 5,
  G: 5 / 4,
  m: 4 / 3,
  M: 45 / 32,
  P: 3 / 2,
  d: 8 / 5,
  D: 5 / 3,
  n: 9 / 5,
  N: 15 / 8
};

// 12-TET Semitone Offsets
const EQUAL_SEMITONES = {
  S: 0, r: 1, R: 2, g: 3, G: 4, m: 5, M: 6, P: 7, d: 8, D: 9, n: 10, N: 11
};

// Western Major Scale Reference for backward compatibility
const MAJOR_SCALE = {
  A:  ["A","B","C#","D","E","F#","G#"],
  Bb: ["Bb","C","D","Eb","F","G","A"],
  B:  ["B","C#","D#","E","F#","G#","A#"],
  C:  ["C","D","E","F","G","A","B"],
  Db: ["Db","Eb","F","Gb","Ab","Bb","C"],
  D:  ["D","E","F#","G","A","B","C#"],
  Eb: ["Eb","F","G","Ab","Bb","C","D"],
  E:  ["E","F#","G#","A","B","C#","D#"],
  F:  ["F","G","A","Bb","C","D","E"],
  Gb: ["Gb","Ab","Bb","Cb","Db","Eb","F"],
  G:  ["G","A","B","C","D","E","F#"],
  Ab: ["Ab","Bb","C","Db","Eb","F","G"]
};

const DEGREE_SEMITONES = { 1: 0, 2: 2, 3: 4, 4: 5, 5: 7, 6: 9, 7: -1 };
const NUMERAL_TO_DEGREE = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7 };

// State Variables
let currentMode = "indian"; // "indian" or "western"
let currentThaatKey = "bilawal";
let currentTonicFreq = Number(keySelectEl.value);
let currentKeyName = keySelectEl.selectedOptions[0].dataset.note;
let currentTuning = "shruti"; // "shruti" or "equal"
let currentTimbre = "bansuri";
let isTanpuraActive = true;
let tanpuraFirstString = "P";
let tanpuraVolume = 0.65;

// ---- Finger Landmark Indices ----
const FINGERS = {
  index:  { pip: 6, tip: 8 },
  middle: { pip: 10, tip: 12 },
  ring:   { pip: 14, tip: 16 },
  pinky:  { pip: 18, tip: 20 },
};

function isFingerExtended(landmarks, name) {
  const { pip, tip } = FINGERS[name];
  return landmarks[tip].y < landmarks[pip].y;
}

function isThumbExtended(landmarks, handedness) {
  const thumbTip = landmarks[4];
  const thumbIp = landmarks[3];
  return handedness === "Right" ? thumbTip.x > thumbIp.x : thumbTip.x < thumbIp.x;
}

function getHandHorizontalTilt(landmarks, handedness) {
  if (!landmarks || landmarks.length < 18) return 0;
  try {
    const wrist = landmarks[0];
    const middleMcp = landmarks[9];
    const ringMcp = landmarks[13];
    if (!wrist || !middleMcp || !ringMcp) return 0;

    const minX = Math.min(middleMcp.x, ringMcp.x);
    const maxX = Math.max(middleMcp.x, ringMcp.x);
    const MAX_TRAVEL = 0.12;

    let tiltFactor = 0;
    if (wrist.x < minX) {
      tiltFactor = (wrist.x - minX) / MAX_TRAVEL;
    } else if (wrist.x > maxX) {
      tiltFactor = (wrist.x - maxX) / MAX_TRAVEL;
    } else {
      tiltFactor = 0;
    }

    tiltFactor = Math.max(-1, Math.min(1, tiltFactor));
    if (handedness === "Right") {
      tiltFactor = -tiltFactor;
    }
    return tiltFactor;
  } catch {
    return 0;
  }
}

// ---- Indian Classical Swara Classifier (Left Hand) ----
function classifySwara(landmarks, handedness, thaatKey) {
  const thumb = isThumbExtended(landmarks, handedness);
  const index = isFingerExtended(landmarks, "index");
  const middle = isFingerExtended(landmarks, "middle");
  const ring = isFingerExtended(landmarks, "ring");
  const pinky = isFingerExtended(landmarks, "pinky");

  const tilt = getHandHorizontalTilt(landmarks, handedness);
  const activeThaat = THAATS[thaatKey] || THAATS.bilawal;
  const thaatSwaras = activeThaat.swaras;

  // Gesture 6: Index + Pinky (Dhaivat / 6th)
  if (index && pinky && !middle && !ring && !thumb) {
    if (tilt > 0.25) return "D";
    if (tilt < -0.25) return "d";
    return thaatSwaras[5]; // Default to Thaat
  }

  // Gesture 7: Index + Pinky + Thumb (Nishad / 7th)
  if (index && pinky && !middle && !ring && thumb) {
    if (tilt > 0.25) return "N";
    if (tilt < -0.25) return "n";
    return thaatSwaras[6];
  }

  const fingerCount = [thumb, index, middle, ring, pinky].filter(Boolean).length;

  switch (fingerCount) {
    case 1:
      return "S"; // Sa (Shadja)
    case 2:
      // Re (Rishabh)
      if (tilt > 0.25) return "R";
      if (tilt < -0.25) return "r";
      return thaatSwaras[1];
    case 3:
      // Ga (Gandhar)
      if (tilt > 0.25) return "G";
      if (tilt < -0.25) return "g";
      return thaatSwaras[2];
    case 4:
      // Ma (Madhyam)
      if (tilt > 0.25) return "M"; // Outward tilt = Teevra Ma
      if (tilt < -0.25) return "m"; // Inward tilt = Shuddha Ma
      return thaatSwaras[3];
    case 5:
      return "P"; // Pa (Pancham, Achala)
    default:
      return null;
  }
}

// Western Chord Quality for backward compatibility
function getChordQuality(landmarks) {
  const wrist = landmarks[0];
  const middleMcp = landmarks[9];
  return middleMcp.x > wrist.x ? "minor" : "major";
}

function classifyWesternChord(landmarks, handedness) {
  const thumb = isThumbExtended(landmarks, handedness);
  const index = isFingerExtended(landmarks, "index");
  const middle = isFingerExtended(landmarks, "middle");
  const ring = isFingerExtended(landmarks, "ring");
  const pinky = isFingerExtended(landmarks, "pinky");

  const quality = getChordQuality(landmarks);

  if (index && pinky && !middle && !ring && !thumb) {
    return quality === "major" ? "VI" : "vi";
  }

  if (index && pinky && !middle && !ring && thumb) {
    return quality === "major" ? "VII" : "vii";
  }

  const count = [thumb, index, middle, ring, pinky].filter(Boolean).length;
  const ROMAN = { 1: "I", 2: "II", 3: "III", 4: "IV", 5: "V" };
  const base = ROMAN[count];
  if (!base) return null;

  return quality === "major" ? base : base.toLowerCase();
}

// Right Hand Expression & Controls
function getVolumeFromHeight(landmarks) {
  const wrist = landmarks[0];
  const TOP = 0.08;
  const BOTTOM = 0.92;
  const clamped = Math.max(TOP, Math.min(BOTTOM, wrist.y));
  const t = (clamped - TOP) / (BOTTOM - TOP);
  return 1 - t;
}

function getRightHandQualityIndex(landmarks) {
  const index = isFingerExtended(landmarks, "index");
  const middle = isFingerExtended(landmarks, "middle");
  const ring = isFingerExtended(landmarks, "ring");
  const pinky = isFingerExtended(landmarks, "pinky");
  return [index, middle, ring, pinky].filter(Boolean).length;
}

function getSaptak(landmarks, handedness) {
  const thumbOut = isThumbExtended(landmarks, handedness);
  const wrist = landmarks[0];
  if (thumbOut) return "mandra"; // Lower octave
  if (wrist && wrist.y < 0.22) return "tar"; // Higher octave
  return "madhya"; // Middle octave
}

// ---- Calculation of Swara Frequencies ----
function getSwaraFrequency(swaraCode, saptak = "madhya", meendCents = 0) {
  let baseFreq = currentTonicFreq;
  // Standardize tonic into central pitch range
  while (baseFreq < 130) baseFreq *= 2;
  while (baseFreq > 280) baseFreq /= 2;

  let ratio = 1.0;
  if (currentTuning === "shruti") {
    ratio = SHRUTI_RATIOS[swaraCode] || 1.0;
  } else {
    const semitones = EQUAL_SEMITONES[swaraCode] || 0;
    ratio = Math.pow(2, semitones / 12);
  }

  let freq = baseFreq * ratio;

  // Saptak multiplier
  if (saptak === "mandra") freq *= 0.5;
  if (saptak === "tar") freq *= 2.0;

  // Meend (Continuous Microtonal Pitch Glide)
  if (meendCents !== 0) {
    freq *= Math.pow(2, meendCents / 1200);
  }

  return freq;
}

// ---- Algorithmic 4-String Tanpura Synthesizer ----
class TanpuraEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.timerId = null;
    this.stringStep = 0;
    this.pluckIntervalMs = 1350; // Meditative tempo
  }

  init(audioCtx) {
    this.ctx = audioCtx;
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = isTanpuraActive ? tanpuraVolume : 0;
    this.masterGain.connect(this.ctx.destination);
  }

  setVolume(vol) {
    if (!this.masterGain || !this.ctx) return;
    tanpuraVolume = vol;
    if (isTanpuraActive) {
      this.masterGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.05);
    }
  }

  start() {
    if (this.timerId || !this.ctx) return;
    this.stringStep = 0;
    this.scheduleNextPluck();
  }

  stop() {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  scheduleNextPluck() {
    this.pluckString(this.stringStep);
    this.stringStep = (this.stringStep + 1) % 4;
    this.timerId = setTimeout(() => this.scheduleNextPluck(), this.pluckIntervalMs);
  }

  pluckString(step) {
    if (!this.ctx || !isTanpuraActive) return;

    let baseSa = currentTonicFreq;
    while (baseSa < 130) baseSa *= 2;
    while (baseSa > 280) baseSa /= 2;

    let targetFreq;
    // 4-string cycle:
    // String 0: First string (Pa, Ma, or Ni in Mandra Saptak)
    // String 1: Jodi 1 (Madhya Sa)
    // String 2: Jodi 2 (Madhya Sa with slight acoustic detune)
    // String 3: Kharaj Sa (Mandra Sa)
    if (step === 0) {
      if (tanpuraFirstString === "P") {
        targetFreq = baseSa * 0.75; // Mandra Pa (3/4 of Sa)
      } else if (tanpuraFirstString === "m") {
        targetFreq = baseSa * (2 / 3); // Mandra Ma
      } else {
        targetFreq = baseSa * (15 / 16); // Mandra Ni
      }
    } else if (step === 1) {
      targetFreq = baseSa; // Madhya Sa
    } else if (step === 2) {
      targetFreq = baseSa * 1.0022; // Subtle detuning for Jwari chorusing
    } else {
      targetFreq = baseSa * 0.5; // Kharaj Sa (Lower octave)
    }

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const jwariFilter = this.ctx.createBiquadFilter();
    const pluckGain = this.ctx.createGain();

    // Sawtooth blended with acoustic Jwari bridge filter
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(targetFreq, now);

    // Resonant bandpass filter simulating the curved bone/wood bridge with cotton thread
    jwariFilter.type = "bandpass";
    jwariFilter.frequency.setValueAtTime(targetFreq * 3.5, now);
    jwariFilter.Q.setValueAtTime(3.2, now);

    // Dynamic pluck envelope: fast attack (15ms), long resonant decay (4.2s)
    pluckGain.gain.setValueAtTime(0, now);
    pluckGain.gain.linearRampToValueAtTime(0.45, now + 0.02);
    pluckGain.gain.exponentialRampToValueAtTime(0.001, now + 4.2);

    osc.connect(jwariFilter);
    jwariFilter.connect(pluckGain);
    pluckGain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 4.3);
  }
}

// ---- Main Synth Engine (Bansuri, Sitar, Harmonium, etc.) ----
class SynthEngine {
  constructor() {
    this.ctx = null;
    this.filter = null;
    this.waveShaper = null;
    this.masterGain = null;
    this.oscillators = [];
    this.currentKey = null;
    this.tanpura = new TanpuraEngine();
  }

  ensureContext() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();

    this.waveShaper = this.ctx.createWaveShaper();
    this.waveShaper.curve = null;
    this.waveShaper.oversample = "4x";

    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = "lowpass";
    this.filter.frequency.value = 1600;
    this.filter.Q.value = 1.0;

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0;

    this.waveShaper.connect(this.filter);
    this.filter.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);

    this.tanpura.init(this.ctx);
    if (isTanpuraActive) {
      this.tanpura.start();
    }
  }

  setVolume(vol01) {
    if (!this.ctx) return;
    const clamped = Math.max(0, Math.min(1, vol01));
    this.masterGain.gain.linearRampToValueAtTime(clamped, this.ctx.currentTime + 0.04);
  }

  updateFilter(tiltFactor) {
    if (!this.filter || !this.ctx) return;
    let targetFreq = 1600;
    let targetQ = 1.0;

    if (tiltFactor < 0) {
      const amt = Math.abs(tiltFactor);
      targetFreq = 1600 - (amt * 1100);
      targetQ = 1.0 + (amt * 1.5);
    } else {
      targetFreq = 1600 + (tiltFactor * 3200);
      targetQ = 1.0 + (tiltFactor * 3.5);
    }

    const now = this.ctx.currentTime;
    this.filter.frequency.setTargetAtTime(targetFreq, now, 0.04);
    this.filter.Q.setTargetAtTime(targetQ, now, 0.04);
  }

  playIndianSwara(swaraCode, saptak, qualityIndex, meendCents) {
    if (!this.ctx || !swaraCode) return;

    if (!hasPlayedFirstSound) {
      hasPlayedFirstSound = true;
      trackClarityEvent("first_sound");
    }

    const mainFreq = getSwaraFrequency(swaraCode, saptak, meendCents);
    let freqs = [mainFreq];

    // Right-Hand Polyphony / Accompaniment:
    // 1: Solo Swara
    // 2: Swara + Sa drone
    // 3: Swara + Sa + Pa
    // 4: Swarmandal chord (Sa, Ga/g, Pa, Ni/n)
    if (qualityIndex === 2) {
      const saFreq = getSwaraFrequency("S", "madhya", 0);
      if (Math.abs(mainFreq - saFreq) > 2) freqs.push(saFreq);
    } else if (qualityIndex === 3) {
      const saFreq = getSwaraFrequency("S", "madhya", 0);
      const paFreq = getSwaraFrequency("P", "mandra", 0);
      freqs.push(saFreq, paFreq);
    } else if (qualityIndex >= 4) {
      const saFreq = getSwaraFrequency("S", "madhya", 0);
      const gaFreq = getSwaraFrequency("G", "madhya", 0);
      const paFreq = getSwaraFrequency("P", "madhya", 0);
      freqs.push(saFreq, gaFreq, paFreq);
    }

    this.applyOscillators(freqs);
  }

  playWesternChord(freqs) {
    if (!this.ctx || freqs.length === 0) return;
    this.applyOscillators(freqs);
  }

  applyOscillators(freqs) {
    const key = freqs.map((f) => f.toFixed(1)).join(",");
    if (key === this.currentKey && this.oscillators.length === freqs.length) {
      // Smooth frequency updates during Meend / pitch glide
      freqs.forEach((freq, i) => {
        if (this.oscillators[i]) {
          this.oscillators[i].frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.03);
        }
      });
      return;
    }

    this.stopOscillators();

    this.oscillators = freqs.map((freq) => {
      const osc = this.ctx.createOscillator();
      
      // Timbre shaping
      if (currentTimbre === "bansuri") {
        osc.type = "triangle";
      } else if (currentTimbre === "sitar") {
        osc.type = "sawtooth";
      } else if (currentTimbre === "harmonium") {
        osc.type = "sawtooth";
      } else {
        osc.type = currentTimbre; // "triangle" or "sawtooth"
      }

      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.connect(this.waveShaper);
      osc.start();
      return osc;
    });

    this.currentKey = key;
  }

  stopOscillators() {
    this.oscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    });
    this.oscillators = [];
    this.currentKey = null;
  }

  stop() {
    this.setVolume(0);
    this.stopOscillators();
  }
}

const synth = new SynthEngine();
let hasPlayedFirstSound = false;
let lastTrackedChord = null;

// ---- Western Chord Mathematics (for Western Mode) ----
function getChordTones(numeralStr, isMajorMode) {
  if (!numeralStr || numeralStr === "--") return null;
  const degree = NUMERAL_TO_DEGREE[numeralStr.toUpperCase()];
  if (!degree) return null;

  const semitones = DEGREE_SEMITONES[degree];
  let tonic = currentTonicFreq;
  while (tonic < 130) tonic *= 2;
  const root = tonic * Math.pow(2, semitones / 12);

  const thirdSemitones = isMajorMode ? 4 : 3;
  const fifthSemitones = 7;
  const maj7Semitones = 11;
  const dom7Semitones = 10;
  const dim7Semitones = 9;

  const third = root * Math.pow(2, thirdSemitones / 12);
  const fifth = root * Math.pow(2, fifthSemitones / 12);
  const octaveRoot = root * 2;
  const octaveThird = third * 2;
  const maj7Tone = root * Math.pow(2, maj7Semitones / 12);
  const dom7Tone = root * Math.pow(2, dom7Semitones / 12);
  const dim7Tone = root * Math.pow(2, dim7Semitones / 12);
  const dim5Tone = root * Math.pow(2, 6 / 12);

  return { root, third, fifth, octaveRoot, octaveThird, maj7Tone, dom7Tone, dim7Tone, dim5Tone };
}

function getSolidNotes(tones, rightHandCount, isMajorMode) {
  if (!tones) return [];
  const { root, third, fifth, octaveRoot, octaveThird, maj7Tone, dom7Tone, dim7Tone, dim5Tone } = tones;

  if (isMajorMode) {
    switch (rightHandCount) {
      case 1: return [root, fifth, octaveRoot, octaveThird];
      case 2: return [third, fifth, octaveRoot, octaveThird];
      case 3: return [root, third, fifth, maj7Tone];
      case 4: return [root, third, fifth, dom7Tone];
      default: return [root, fifth, octaveRoot, octaveThird];
    }
  } else {
    switch (rightHandCount) {
      case 1: return [root, fifth, octaveRoot, octaveThird];
      case 2: return [third, fifth, octaveRoot, octaveThird];
      case 3: return [root, third, fifth, dom7Tone];
      case 4: return [root, third, dim5Tone, dim7Tone];
      default: return [root, fifth, octaveRoot, octaveThird];
    }
  }
}

// ---- UI Update & Dynamic Mudra Guide ----
function updateGestureGuide() {
  if (!guideContentEl) return;

  if (currentMode === "indian") {
    const activeThaat = THAATS[currentThaatKey] || THAATS.bilawal;
    const GESTURES = [
      { degree: 1, gesture: "☝️ 1 Finger", hint: "Tonic" },
      { degree: 2, gesture: "✌️ 2 Fingers", hint: "Tilt: Komal / Shuddha" },
      { degree: 3, gesture: "🤟 3 Fingers", hint: "Tilt: Komal / Shuddha" },
      { degree: 4, gesture: "🖖 4 Fingers", hint: "Tilt: Shuddha / Teevra" },
      { degree: 5, gesture: "🖐️ 5 Fingers", hint: "Achala Pa" },
      { degree: 6, gesture: "🤘 Index + Pinky", hint: "Tilt: Komal / Shuddha" },
      { degree: 7, gesture: "🤌 Index + Pinky + Thumb", hint: "Tilt: Komal / Shuddha" }
    ];

    guideContentEl.innerHTML = activeThaat.swaras.map((swaraCode, idx) => {
      const swara = SWARAS[swaraCode];
      const g = GESTURES[idx];
      return `
        <div class="gesture-guide-row">
          <span class="gesture-guide-swara">${swara.hindi} (${swara.name})</span>
          <span class="gesture-guide-note">${g.gesture}</span>
        </div>
      `;
    }).join("");
  } else {
    const GESTURE_GUIDE = [
      { degree: 1, gesture: "1️⃣" },
      { degree: 2, gesture: "2️⃣" },
      { degree: 3, gesture: "3️⃣" },
      { degree: 4, gesture: "4️⃣" },
      { degree: 5, gesture: "5️⃣" },
      { degree: 6, gesture: "🤘" },
      { degree: 7, gesture: "🤟" }
    ];
    const scale = MAJOR_SCALE[currentKeyName] || MAJOR_SCALE.C;
    guideContentEl.innerHTML = GESTURE_GUIDE.map(({ degree, gesture }) => `
      <div class="gesture-guide-row">
        <span class="gesture-guide-swara">${scale[degree - 1]}</span>
        <span class="gesture-guide-note">${gesture}</span>
      </div>
    `).join("");
  }
}

// ---- Visual Energy Wave (Canvas Visualizer) ----
function drawEnergy(ctx, volume01, qualityIndex, tiltFactor, activeNoteOrSwara) {
  if (!ctx) return;
  const lineCount = Math.max(1, Math.min(4, qualityIndex || 1));
  const centerY = ctx.canvas.height - 70;
  const canvasWidth = ctx.canvas.width;

  const maxThickness = 1 + (volume01 * 8);
  const chaosScale = (tiltFactor + 1) / 2;
  const shakinessAmp = chaosScale * 22;
  const shakinessFreq = 0.05 + (chaosScale * 0.12);

  // Colors mapped to Swaras & Scale Degrees
  const SWARA_COLORS = {
    S: "245, 158, 11",   // Sa: Golden Sunset
    r: "239, 68, 68",    // Komal Re: Crimson
    R: "249, 115, 22",   // Shuddha Re: Tangerine
    g: "236, 72, 153",   // Komal Ga: Magenta Rose
    G: "217, 70, 239",   // Shuddha Ga: Violet
    m: "16, 185, 129",   // Shuddha Ma: Emerald
    M: "6, 182, 212",    // Teevra Ma: Peacock Teal
    P: "245, 158, 11",   // Pa: Imperial Gold
    d: "139, 92, 246",   // Komal Dha: Royal Purple
    D: "99, 102, 241",   // Shuddha Dha: Indigo
    n: "59, 130, 246",   // Komal Ni: Sky Blue
    N: "14, 165, 233"    // Shuddha Ni: Cyan
  };

  const baseColorRGB = (activeNoteOrSwara && SWARA_COLORS[activeNoteOrSwara]) || "245, 158, 11";
  const brightnessAlpha = activeNoteOrSwara ? 0.9 : 0.25;

  ctx.save();
  const time = performance.now() * 0.0035;
  const [r, g, b] = baseColorRGB.split(",").map(Number);

  ctx.shadowBlur = 12 + (volume01 * 25);
  ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${0.6 * brightnessAlpha})`;

  for (let l = 0; l < lineCount; l++) {
    ctx.beginPath();
    const lineYOffset = centerY + (l - (lineCount - 1) / 2) * 12;

    for (let x = 0; x <= canvasWidth; x += 12) {
      const baseSine = Math.sin(x * 0.005 + time + l * 0.45) * 18;
      const jitter = (Math.random() - 0.5) * shakinessAmp * Math.sin(x * shakinessFreq + time);
      const y = lineYOffset + baseSine + jitter;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${brightnessAlpha})`;
    ctx.lineWidth = Math.max(1, maxThickness - (l * 0.4));
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  }
  ctx.restore();
}

// ---- Gesture State Debouncing & Stabilization ----
const CHORD_HOLD_TIME_MS = 85;
const VIBE_NULL_WINDOW_MS = 50;

let stableState = null;
let candidateState = null;
let candidateSince = 0;
let lastSeenValidTime = 0;

function sameState(a, b) {
  if (a === null && b === null) return true;
  if (a === null || b === null) return false;
  return a.item === b.item && a.saptak === b.saptak && a.qualityIndex === b.qualityIndex;
}

function stabilizeState(rawState, now) {
  if (rawState !== null) lastSeenValidTime = now;
  let effectiveState = rawState;
  if (rawState === null && now - lastSeenValidTime < VIBE_NULL_WINDOW_MS) {
    effectiveState = candidateState;
  }
  if (!sameState(effectiveState, candidateState)) {
    candidateState = effectiveState;
    candidateSince = now;
  }
  if (now - candidateSince >= CHORD_HOLD_TIME_MS) {
    stableState = candidateState;
  }
  return stableState;
}

function updateVolumeMeter(volume01) {
  const litCount = Math.round(volume01 * volumeBarEls.length);
  volumeBarEls.forEach((bar) => {
    const index = Number(bar.dataset.index);
    bar.classList.toggle("lit", index >= volumeBarEls.length - litCount);
  });
}

// ---- Camera & MediaPipe Setup ----
async function setupCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: 640, height: 480 },
    audio: false,
  });
  videoEl.srcObject = stream;
  return new Promise((resolve) => {
    videoEl.onloadedmetadata = () => {
      videoEl.play();
      resolve();
    };
  });
}

async function setupHandLandmarker() {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
  );
  return HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    numHands: 2,
  });
}

// Cover cropping to mirror canvas without distortion
function computeCoverRect(srcW, srcH, dstW, dstH) {
  const srcRatio = srcW / srcH;
  const dstRatio = dstW / dstH;
  if (srcRatio > dstRatio) {
    const sHeight = srcH;
    const sWidth = srcH * dstRatio;
    return { sx: (srcW - sWidth) / 2, sy: 0, sWidth, sHeight };
  } else {
    const sWidth = srcW;
    const sHeight = srcW / dstRatio;
    return { sx: 0, sy: (srcH - sHeight) / 2, sWidth, sHeight };
  }
}

function drawFrame(results, canvasWidth, canvasHeight) {
  const srcW = videoEl.videoWidth;
  const srcH = videoEl.videoHeight;
  if (!srcW || !srcH) return;

  const { sx, sy, sWidth, sHeight } = computeCoverRect(srcW, srcH, canvasWidth, canvasHeight);

  ctx.save();
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.translate(canvasWidth, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(videoEl, sx, sy, sWidth, sHeight, 0, 0, canvasWidth, canvasHeight);

  // Render tracking landmarks
  ctx.fillStyle = "rgba(245, 158, 11, 0.7)";
  for (const landmarks of results.landmarks) {
    for (const point of landmarks) {
      const videoPx = point.x * srcW;
      const videoPy = point.y * srcH;
      const canvasX = ((videoPx - sx) / sWidth) * canvasWidth;
      const canvasY = ((videoPy - sy) / sHeight) * canvasHeight;

      ctx.beginPath();
      ctx.arc(canvasX, canvasY, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function resizeCanvas() {
  canvasEl.width = window.innerWidth;
  canvasEl.height = window.innerHeight;
}

// ---- Event Listeners ----
modeSelectEl.addEventListener("change", () => {
  currentMode = modeSelectEl.value;
  thaatGroupEl.style.display = currentMode === "indian" ? "flex" : "none";
  updateGestureGuide();
});

thaatSelectEl.addEventListener("change", () => {
  currentThaatKey = thaatSelectEl.value;
  updateGestureGuide();
});

keySelectEl.addEventListener("change", () => {
  currentTonicFreq = Number(keySelectEl.value);
  currentKeyName = keySelectEl.selectedOptions[0].dataset.note;
  updateGestureGuide();
});

tuningSelectEl.addEventListener("change", () => {
  currentTuning = tuningSelectEl.value;
});

toneSelectEl.addEventListener("change", () => {
  currentTimbre = toneSelectEl.value;
  synth.currentKey = null;
});

tanpuraToggleEl.addEventListener("click", () => {
  isTanpuraActive = !isTanpuraActive;
  tanpuraToggleEl.classList.toggle("active", isTanpuraActive);
  tanpuraToggleEl.textContent = isTanpuraActive ? "ON" : "OFF";
  if (isTanpuraActive) {
    synth.tanpura.start();
    synth.tanpura.setVolume(tanpuraVolume);
  } else {
    synth.tanpura.stop();
  }
});

tanpuraStringSelectEl.addEventListener("change", () => {
  tanpuraFirstString = tanpuraStringSelectEl.value;
});

tanpuraVolumeEl.addEventListener("input", (e) => {
  tanpuraVolume = parseFloat(e.target.value);
  synth.tanpura.setVolume(tanpuraVolume);
});

guideToggleEl.addEventListener("click", () => {
  const isHidden = gestureGuideEl.classList.toggle("hidden");
  guideToggleEl.textContent = isHidden ? "Mudra Guide" : "Close Guide";
});

helpButton.addEventListener("click", () => {
  helpModal.classList.remove("hidden");
});

closeHelp.addEventListener("click", (e) => {
  e.stopPropagation();
  helpModal.classList.add("hidden");
});

helpModal.addEventListener("click", (e) => {
  if (e.target === helpModal) helpModal.classList.add("hidden");
});

startOverlayEl.addEventListener("click", () => {
  synth.ensureContext();
  startOverlayEl.style.display = "none";
  canvasEl.classList.remove("dimmed");
});

// Initialize Guide
updateGestureGuide();

// ---- Main Application Loop ----
async function main() {
  await setupCamera();
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  const handLandmarker = await setupHandLandmarker();
  let lastVideoTime = -1;
  let cachedLeftLandmarks = null;
  let cachedRightLandmarks = null;

  function loop() {
    const timestampNow = performance.now();

    // 1. Process Video Frame
    if (videoEl.currentTime !== lastVideoTime) {
      lastVideoTime = videoEl.currentTime;
      const results = handLandmarker.detectForVideo(videoEl, timestampNow);
      drawFrame(results, canvasEl.width, canvasEl.height);

      cachedLeftLandmarks = null;
      cachedRightLandmarks = null;

      results.landmarks.forEach((landmarks, i) => {
        const handedness = results.handedness[i][0].categoryName;
        if (handedness === "Left") cachedLeftLandmarks = landmarks;
        if (handedness === "Right") cachedRightLandmarks = landmarks;
      });
    }

    // 2. Gesture Extraction
    let rawItem = null;
    let rawModeOrThaat = currentThaatKey;
    let rawQualityIndex = 0;
    let rawSaptak = "madhya";
    let rawState = null;

    // LEFT HAND = Swara (Indian) or Chord (Western)
    if (cachedLeftLandmarks) {
      if (currentMode === "indian") {
        rawItem = classifySwara(cachedLeftLandmarks, "Left", currentThaatKey);
      } else {
        rawItem = classifyWesternChord(cachedLeftLandmarks, "Left");
      }
    }

    // RIGHT HAND = Voicing, Saptak, Meend & Volume
    let rightTilt = 0;
    let meendCents = 0;
    let currentVolume = 0;

    if (cachedRightLandmarks) {
      currentVolume = getVolumeFromHeight(cachedRightLandmarks);
      rawQualityIndex = getRightHandQualityIndex(cachedRightLandmarks);
      rawSaptak = getSaptak(cachedRightLandmarks, "Right");
      rightTilt = getHandHorizontalTilt(cachedRightLandmarks, "Right");
      
      // Meend microtonal glide: ±100 cents
      meendCents = Math.round(rightTilt * 100);
    }

    if (rawItem) {
      rawState = {
        item: rawItem,
        saptak: rawSaptak,
        qualityIndex: rawQualityIndex
      };
    }

    // 3. Stabilization
    const stable = stabilizeState(rawState, timestampNow);
    const activeItem = stable ? stable.item : null;
    const activeSaptak = stable ? stable.saptak : rawSaptak;
    const activeQualityIndex = stable ? stable.qualityIndex : rawQualityIndex;

    // 4. Update HUD
    updateVolumeMeter(currentVolume);

    if (distortionDisplayEl) {
      if (currentMode === "indian") {
        distortionDisplayEl.textContent = `Meend: ${meendCents > 0 ? "+" : ""}${meendCents}¢`;
      } else {
        distortionDisplayEl.textContent = `Filter: ${Math.round(rightTilt * 100)}%`;
      }
    }

    if (activeItem) {
      if (currentMode === "indian") {
        const swaraObj = SWARAS[activeItem] || { hindi: activeItem, name: activeItem };
        swaraDevanagariEl.textContent = swaraObj.hindi;
        chordDisplayEl.textContent = `${swaraObj.name} (${swaraObj.full || activeItem})`;
        
        const SAPTAK_LABELS = {
          mandra: "Mandra Saptak (मंद्र - Lower)",
          madhya: "Madhya Saptak (मध्य - Middle)",
          tar: "Tar Saptak (तार - Higher)"
        };
        saptakIndicatorEl.textContent = SAPTAK_LABELS[activeSaptak] || "Madhya Saptak";

        const VOICING_LABELS = {
          1: "Solo Melodic Swara",
          2: "Swara + Sa Drone",
          3: "Swara + Sa + Pa Accompaniment",
          4: "Swarmandal Resonant Cascade"
        };
        qualityDisplayEl.textContent = VOICING_LABELS[activeQualityIndex] || "Melodic Solo";
      } else {
        swaraDevanagariEl.textContent = "";
        chordDisplayEl.textContent = activeItem;
        saptakIndicatorEl.textContent = activeSaptak === "mandra" ? "-8ve" : "Normal";
        qualityDisplayEl.textContent = `Quality: ${activeQualityIndex}`;
      }
    } else {
      swaraDevanagariEl.textContent = "--";
      chordDisplayEl.textContent = "--";
      qualityDisplayEl.textContent = "--";
      saptakIndicatorEl.textContent = "Neutral";
    }

    // 5. Audio Synthesis
    synth.updateFilter(rightTilt);

    if (cachedRightLandmarks && activeItem && activeQualityIndex >= 1) {
      synth.setVolume(currentVolume);

      if (currentMode === "indian") {
        synth.playIndianSwara(activeItem, activeSaptak, activeQualityIndex, meendCents);
      } else {
        const tones = getChordTones(activeItem, true);
        let notes = getSolidNotes(tones, activeQualityIndex, true);
        if (activeSaptak === "mandra") notes = notes.map((f) => f / 2);
        synth.playWesternChord(notes);
      }
    } else {
      synth.setVolume(0);
    }

    // 6. Visual Wave Rendering
    drawEnergy(ctx, currentVolume, activeQualityIndex, rightTilt, activeItem);

    requestAnimationFrame(loop);
  }

  loop();
}

main().catch((err) => console.error("Initialization error:", err));
