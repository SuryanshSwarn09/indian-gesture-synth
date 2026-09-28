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

const thaatRibbonEl = document.getElementById("thaatRibbon");
const ribbonThaatNameEl = document.getElementById("ribbonThaatName");
const swaraChipEls = Array.from(document.querySelectorAll(".swara-chip"));

const tanpuraToggleEl = document.getElementById("tanpuraToggle");
const tanpuraStringSelectEl = document.getElementById("tanpuraStringSelect");
const tanpuraVolumeEl = document.getElementById("tanpuraVolume");
const tanpuraWireEls = [
  document.getElementById("wire0"),
  document.getElementById("wire1"),
  document.getElementById("wire2"),
  document.getElementById("wire3")
];

const guideToggleEl = document.getElementById("guideToggle");
const gestureGuideEl = document.getElementById("gestureGuide");
const guideContentEl = document.getElementById("guideContent");

const swaraDevanagariEl = document.getElementById("swaraDevanagari");
const chordDisplayEl = document.getElementById("chordDisplay");
const qualityDisplayEl = document.getElementById("qualityDisplay");
const saptakIndicatorEl = document.getElementById("saptakIndicator");

const meendFillEl = document.getElementById("meendFill");
const distortionDisplayEl = document.getElementById("distortionDisplay");
const volumeBarEls = Array.from(document.querySelectorAll(".vol-bar"));
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
  S: { code: "S", hindi: "सा", name: "Sa", full: "Shadja", degree: 1, type: "achala", color: "245, 158, 11" },
  r: { code: "r", hindi: "रे॒", name: "Komal Re", full: "Komal Rishabh", degree: 2, type: "komal", color: "239, 68, 68" },
  R: { code: "R", hindi: "रे", name: "Shuddha Re", full: "Shuddha Rishabh", degree: 2, type: "shuddha", color: "249, 115, 22" },
  g: { code: "g", hindi: "ग॒", name: "Komal Ga", full: "Komal Gandhar", degree: 3, type: "komal", color: "236, 72, 153" },
  G: { code: "G", hindi: "ग", name: "Shuddha Ga", full: "Shuddha Gandhar", degree: 3, type: "shuddha", color: "217, 70, 239" },
  m: { code: "m", hindi: "म", name: "Shuddha Ma", full: "Shuddha Madhyam", degree: 4, type: "shuddha", color: "16, 185, 129" },
  M: { code: "M", hindi: "म॑", name: "Teevra Ma", full: "Teevra Madhyam", degree: 4, type: "teevra", color: "6, 182, 212" },
  P: { code: "P", hindi: "प", name: "Pa", full: "Pancham", degree: 5, type: "achala", color: "245, 158, 11" },
  d: { code: "d", hindi: "ध॒", name: "Komal Dha", full: "Komal Dhaivat", degree: 6, type: "komal", color: "139, 92, 246" },
  D: { code: "D", hindi: "ध", name: "Shuddha Dha", full: "Shuddha Dhaivat", degree: 6, type: "shuddha", color: "99, 102, 241" },
  n: { code: "n", hindi: "नि॒", name: "Komal Ni", full: "Komal Nishad", degree: 7, type: "komal", color: "59, 130, 246" },
  N: { code: "N", hindi: "नि", name: "Shuddha Ni", full: "Shuddha Nishad", degree: 7, type: "shuddha", color: "14, 165, 233" }
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

// Western Scale Reference for backward compatibility
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
let currentMode = "indian";
let currentThaatKey = "bilawal";
let currentTonicFreq = Number(keySelectEl.value);
let currentKeyName = keySelectEl.selectedOptions[0].dataset.note;
let currentTuning = "shruti";
let currentTimbre = "bansuri";
let isTanpuraActive = true;
let tanpuraFirstString = "P";
let tanpuraVolume = 0.65;

// Ripple Wave Effect for Tanpura plucks
let tanpuraRipples = [];

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

// Left Hand Swara Classifier
function classifySwara(landmarks, handedness, thaatKey) {
  const thumb = isThumbExtended(landmarks, handedness);
  const index = isFingerExtended(landmarks, "index");
  const middle = isFingerExtended(landmarks, "middle");
  const ring = isFingerExtended(landmarks, "ring");
  const pinky = isFingerExtended(landmarks, "pinky");

  const tilt = getHandHorizontalTilt(landmarks, handedness);
  const activeThaat = THAATS[thaatKey] || THAATS.bilawal;
  const thaatSwaras = activeThaat.swaras;

  if (index && pinky && !middle && !ring && !thumb) {
    if (tilt > 0.25) return "D";
    if (tilt < -0.25) return "d";
    return thaatSwaras[5];
  }

  if (index && pinky && !middle && !ring && thumb) {
    if (tilt > 0.25) return "N";
    if (tilt < -0.25) return "n";
    return thaatSwaras[6];
  }

  const fingerCount = [thumb, index, middle, ring, pinky].filter(Boolean).length;

  switch (fingerCount) {
    case 1:
      return "S";
    case 2:
      if (tilt > 0.25) return "R";
      if (tilt < -0.25) return "r";
      return thaatSwaras[1];
    case 3:
      if (tilt > 0.25) return "G";
      if (tilt < -0.25) return "g";
      return thaatSwaras[2];
    case 4:
      if (tilt > 0.25) return "M";
      if (tilt < -0.25) return "m";
      return thaatSwaras[3];
    case 5:
      return "P";
    default:
      return null;
  }
}

function classifyWesternChord(landmarks, handedness) {
  const thumb = isThumbExtended(landmarks, handedness);
  const index = isFingerExtended(landmarks, "index");
  const middle = isFingerExtended(landmarks, "middle");
  const ring = isFingerExtended(landmarks, "ring");
  const pinky = isFingerExtended(landmarks, "pinky");

  const wrist = landmarks[0];
  const middleMcp = landmarks[9];
  const isMinor = middleMcp.x > wrist.x;

  if (index && pinky && !middle && !ring && !thumb) {
    return isMinor ? "vi" : "VI";
  }
  if (index && pinky && !middle && !ring && thumb) {
    return isMinor ? "vii" : "VII";
  }

  const count = [thumb, index, middle, ring, pinky].filter(Boolean).length;
  const ROMAN = { 1: "I", 2: "II", 3: "III", 4: "IV", 5: "V" };
  const base = ROMAN[count];
  if (!base) return null;
  return isMinor ? base.toLowerCase() : base;
}

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
  if (thumbOut) return "mandra";
  if (wrist && wrist.y < 0.22) return "tar";
  return "madhya";
}

function getSwaraFrequency(swaraCode, saptak = "madhya", meendCents = 0) {
  let baseFreq = currentTonicFreq;
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
  if (saptak === "mandra") freq *= 0.5;
  if (saptak === "tar") freq *= 2.0;

  if (meendCents !== 0) {
    freq *= Math.pow(2, meendCents / 1200);
  }
  return freq;
}

// ---- Algorithmic 4-String Tanpura Engine ----
class TanpuraEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.timerId = null;
    this.stringStep = 0;
    this.pluckIntervalMs = 1350;
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

    // Trigger visual string vibration in HUD
    const wireEl = tanpuraWireEls[step];
    if (wireEl) {
      wireEl.classList.add("plucked");
      setTimeout(() => wireEl.classList.remove("plucked"), 300);
    }

    // Spawn harmonic ripple on canvas
    tanpuraRipples.push({
      radius: 20,
      maxRadius: 280,
      opacity: 0.7,
      step: step
    });

    let baseSa = currentTonicFreq;
    while (baseSa < 130) baseSa *= 2;
    while (baseSa > 280) baseSa /= 2;

    let targetFreq;
    if (step === 0) {
      if (tanpuraFirstString === "P") targetFreq = baseSa * 0.75;
      else if (tanpuraFirstString === "m") targetFreq = baseSa * (2 / 3);
      else targetFreq = baseSa * (15 / 16);
    } else if (step === 1) {
      targetFreq = baseSa;
    } else if (step === 2) {
      targetFreq = baseSa * 1.0022; // Micro-detune for Jwari chorusing
    } else {
      targetFreq = baseSa * 0.5; // Kharaj Sa
    }

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const jwariFilter = this.ctx.createBiquadFilter();
    const pluckGain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(targetFreq, now);

    jwariFilter.type = "bandpass";
    jwariFilter.frequency.setValueAtTime(targetFreq * 3.6, now);
    jwariFilter.Q.setValueAtTime(3.4, now);

    pluckGain.gain.setValueAtTime(0, now);
    pluckGain.gain.linearRampToValueAtTime(0.4, now + 0.02);
    pluckGain.gain.exponentialRampToValueAtTime(0.001, now + 4.2);

    osc.connect(jwariFilter);
    jwariFilter.connect(pluckGain);
    pluckGain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 4.3);
  }
}

// ---- High-Fidelity Synthesizer Engine ----
class SynthEngine {
  constructor() {
    this.ctx = null;
    this.filter = null;
    this.waveShaper = null;
    this.masterGain = null;
    this.vibratoOsc = null;
    this.vibratoGain = null;
    this.oscillators = [];
    this.currentKey = null;
    this.tanpura = new TanpuraEngine();
  }

  ensureContext() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();

    this.waveShaper = this.ctx.createWaveShaper();
    this.waveShaper.curve = this.createSoftDistortionCurve(15);
    this.waveShaper.oversample = "4x";

    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = "lowpass";
    this.filter.frequency.value = 1800;
    this.filter.Q.value = 1.2;

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0;

    // Vibrato LFO for authentic Indian vocal/flute Gamaka expression
    this.vibratoOsc = this.ctx.createOscillator();
    this.vibratoOsc.frequency.value = 5.2; // 5.2 Hz gentle vibrato
    this.vibratoGain = this.ctx.createGain();
    this.vibratoGain.gain.value = 2.5; // subtle frequency modulation
    this.vibratoOsc.connect(this.vibratoGain);
    this.vibratoOsc.start();

    this.waveShaper.connect(this.filter);
    this.filter.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);

    this.tanpura.init(this.ctx);
    if (isTanpuraActive) {
      this.tanpura.start();
    }
  }

  createSoftDistortionCurve(amount) {
    const k = typeof amount === "number" ? amount : 15;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  setVolume(vol01) {
    if (!this.ctx) return;
    const clamped = Math.max(0, Math.min(1, vol01));
    this.masterGain.gain.linearRampToValueAtTime(clamped, this.ctx.currentTime + 0.04);
  }

  updateFilter(tiltFactor) {
    if (!this.filter || !this.ctx) return;
    let targetFreq = 1800;
    let targetQ = 1.2;

    if (tiltFactor < 0) {
      const amt = Math.abs(tiltFactor);
      targetFreq = 1800 - (amt * 1250);
      targetQ = 1.2 + (amt * 1.8);
    } else {
      targetFreq = 1800 + (tiltFactor * 3500);
      targetQ = 1.2 + (tiltFactor * 4.0);
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

    // Right-Hand Polyphony / Voicing
    if (qualityIndex === 2) {
      const saFreq = getSwaraFrequency("S", "madhya", 0);
      if (Math.abs(mainFreq - saFreq) > 3) freqs.push(saFreq);
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
      freqs.forEach((freq, i) => {
        if (this.oscillators[i]) {
          this.oscillators[i].frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.035);
        }
      });
      return;
    }

    this.stopOscillators();

    this.oscillators = freqs.map((freq) => {
      const osc = this.ctx.createOscillator();

      if (currentTimbre === "bansuri") {
        osc.type = "triangle";
        // Connect vibrato LFO to simulate authentic bamboo flute air oscillation
        if (this.vibratoGain) this.vibratoGain.connect(osc.frequency);
      } else if (currentTimbre === "sitar") {
        osc.type = "sawtooth";
      } else if (currentTimbre === "harmonium") {
        osc.type = "sawtooth";
      } else {
        osc.type = currentTimbre;
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

// Western Chord Mathematics
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

// ---- UI Ribbon & Guide Synchronization ----
function updateThaatRibbon() {
  const activeThaat = THAATS[currentThaatKey] || THAATS.bilawal;
  if (ribbonThaatNameEl) {
    ribbonThaatNameEl.textContent = activeThaat.name;
  }

  // Update the 7 chips with the Thaat's Swaras
  swaraChipEls.forEach((chip, idx) => {
    const swaraCode = activeThaat.swaras[idx];
    const swara = SWARAS[swaraCode];
    if (swara) {
      chip.dataset.swara = swaraCode;
      chip.textContent = swara.hindi;
    }
  });
}

function highlightActiveSwaraChip(activeSwaraCode) {
  swaraChipEls.forEach((chip) => {
    chip.classList.toggle("active", chip.dataset.swara === activeSwaraCode);
  });
}

function updateGestureGuide() {
  if (!guideContentEl) return;

  if (currentMode === "indian") {
    const activeThaat = THAATS[currentThaatKey] || THAATS.bilawal;
    const GESTURES = [
      { gesture: "☝️ 1 Finger (Sa)", hint: "Tonic" },
      { gesture: "✌️ 2 Fingers (Re)", hint: "Tilt: Komal / Shuddha" },
      { gesture: "🤟 3 Fingers (Ga)", hint: "Tilt: Komal / Shuddha" },
      { gesture: "🖖 4 Fingers (Ma)", hint: "Tilt: Shuddha / Teevra" },
      { gesture: "🖐️ 5 Fingers (Pa)", hint: "Achala" },
      { gesture: "🤘 Index + Pinky (Dha)", hint: "Tilt: Komal / Shuddha" },
      { gesture: "🤌 Index+Pinky+Thumb (Ni)", hint: "Tilt: Komal / Shuddha" }
    ];

    guideContentEl.innerHTML = activeThaat.swaras.map((swaraCode, idx) => {
      const swara = SWARAS[swaraCode];
      const g = GESTURES[idx];
      return `
        <div class="guide-row">
          <span class="guide-swara">${swara.hindi} ${swara.name}</span>
          <span class="guide-mudra">${g.gesture}</span>
        </div>
      `;
    }).join("");
  } else {
    const GESTURE_GUIDE = [
      { degree: 1, gesture: "1️⃣ Root" },
      { degree: 2, gesture: "2️⃣ 2nd" },
      { degree: 3, gesture: "3️⃣ 3rd" },
      { degree: 4, gesture: "4️⃣ 4th" },
      { degree: 5, gesture: "5️⃣ 5th" },
      { degree: 6, gesture: "🤘 6th" },
      { degree: 7, gesture: "🤟 7th" }
    ];
    const scale = MAJOR_SCALE[currentKeyName] || MAJOR_SCALE.C;
    guideContentEl.innerHTML = GESTURE_GUIDE.map(({ degree, gesture }) => `
      <div class="guide-row">
        <span class="guide-swara">${scale[degree - 1]}</span>
        <span class="guide-mudra">${gesture}</span>
      </div>
    `).join("");
  }
}

// ---- Sacred Geometric Harmonic Chakra / Mandala Visualizer ----
function drawChakraMandala(ctx, canvasWidth, canvasHeight, volume01, qualityIndex, tiltFactor, activeItem) {
  if (!ctx) return;

  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2 - 30;
  const time = performance.now() * 0.001;

  // Swara color extraction
  const swaraObj = (activeItem && SWARAS[activeItem]) || { color: "245, 158, 11" };
  const [r, g, b] = swaraObj.color.split(",").map(Number);

  ctx.save();

  // 1. Draw Expanding Tanpura Pluck Ripples
  for (let i = tanpuraRipples.length - 1; i >= 0; i--) {
    const ripple = tanpuraRipples[i];
    ripple.radius += 2.8;
    ripple.opacity *= 0.975;

    ctx.beginPath();
    ctx.arc(centerX, centerY, ripple.radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(245, 158, 11, ${ripple.opacity * 0.4})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    if (ripple.radius > ripple.maxRadius || ripple.opacity < 0.02) {
      tanpuraRipples.splice(i, 1);
    }
  }

  // 2. Draw Resonant Harmonic Chakra
  const isPlaying = volume01 > 0.02 && Boolean(activeItem);
  const baseRadius = 60 + (volume01 * 140);
  const numPetals = 12; // 12 Svarasthanas / Shrutis
  const rotationAngle = time * 0.3 + (tiltFactor * 0.8);

  ctx.translate(centerX, centerY);
  ctx.rotate(rotationAngle);

  // Outer Petal Ring
  ctx.beginPath();
  for (let i = 0; i < numPetals; i++) {
    const angle = (i * 2 * Math.PI) / numPetals;
    const petalX = Math.cos(angle) * baseRadius;
    const petalY = Math.sin(angle) * baseRadius;

    const ctrlAngle1 = angle - 0.2;
    const ctrlAngle2 = angle + 0.2;
    const peakRadius = baseRadius + (isPlaying ? 35 + Math.sin(time * 3 + i) * 12 : 12);
    const peakX = Math.cos(angle) * peakRadius;
    const peakY = Math.sin(angle) * peakRadius;

    if (i === 0) ctx.moveTo(petalX, petalY);
    ctx.quadraticCurveTo(Math.cos(ctrlAngle1) * (baseRadius + 15), Math.sin(ctrlAngle1) * (baseRadius + 15), peakX, peakY);
    ctx.quadraticCurveTo(Math.cos(ctrlAngle2) * (baseRadius + 15), Math.sin(ctrlAngle2) * (baseRadius + 15), petalX, petalY);
  }
  ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${isPlaying ? 0.75 : 0.25})`;
  ctx.lineWidth = isPlaying ? 2.5 : 1.2;
  ctx.shadowBlur = isPlaying ? 25 : 8;
  ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.8)`;
  ctx.stroke();

  // Inner Yantra Star / Polygon Ring
  const innerPoints = 8;
  const innerRadius = baseRadius * 0.55;
  ctx.beginPath();
  for (let i = 0; i < innerPoints * 2; i++) {
    const rad = i % 2 === 0 ? innerRadius : innerRadius * 0.65;
    const a = (i * Math.PI) / innerPoints;
    const px = Math.cos(a) * rad;
    const py = Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.strokeStyle = `rgba(254, 240, 138, ${isPlaying ? 0.7 : 0.2})`;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Core Bindu (Center Energy Dot)
  ctx.beginPath();
  ctx.arc(0, 0, isPlaying ? 8 + volume01 * 10 : 5, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(254, 240, 138, ${isPlaying ? 0.95 : 0.4})`;
  ctx.fill();

  ctx.restore();

  // 3. Lower Dynamic Wave Ribbons
  const ribbonCount = Math.max(1, Math.min(4, qualityIndex || 1));
  const ribbonY = canvasHeight - 85;
  const maxThickness = 1 + (volume01 * 8);

  ctx.save();
  for (let l = 0; l < ribbonCount; l++) {
    ctx.beginPath();
    const lineYOffset = ribbonY + (l - (ribbonCount - 1) / 2) * 12;

    for (let x = 0; x <= canvasWidth; x += 12) {
      const baseSine = Math.sin(x * 0.005 + time * 3.5 + l * 0.45) * 16;
      const jitter = (Math.random() - 0.5) * (tiltFactor * 18);
      const y = lineYOffset + baseSine + jitter;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${isPlaying ? 0.85 : 0.25})`;
    ctx.lineWidth = Math.max(1, maxThickness - l * 0.4);
    ctx.lineCap = "round";
    ctx.stroke();
  }
  ctx.restore();
}

// Hand Skeleton Connections for elegant bone rendering
const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],       // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8],       // Index
  [5, 9], [9, 10], [10, 11], [11, 12],  // Middle
  [9, 13], [13, 14], [14, 15], [15, 16],// Ring
  [13, 17], [17, 18], [18, 19], [19, 20],// Pinky
  [0, 17]                               // Palm base
];

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

  // Subtle dark radial vignette for dramatic Indian concert ambiance
  const vignette = ctx.createRadialGradient(
    canvasWidth / 2, canvasHeight / 2, canvasWidth * 0.2,
    canvasWidth / 2, canvasHeight / 2, canvasWidth * 0.75
  );
  vignette.addColorStop(0, "rgba(7, 9, 14, 0.25)");
  vignette.addColorStop(1, "rgba(7, 9, 14, 0.75)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Render Hand Skeleton & Nodes
  for (const landmarks of results.landmarks) {
    const coords = landmarks.map((p) => {
      const videoPx = p.x * srcW;
      const videoPy = p.y * srcH;
      return {
        x: ((videoPx - sx) / sWidth) * canvasWidth,
        y: ((videoPy - sy) / sHeight) * canvasHeight
      };
    });

    // Bone lines
    ctx.beginPath();
    for (const [start, end] of HAND_CONNECTIONS) {
      if (coords[start] && coords[end]) {
        ctx.moveTo(coords[start].x, coords[start].y);
        ctx.lineTo(coords[end].x, coords[end].y);
      }
    }
    ctx.strokeStyle = "rgba(245, 158, 11, 0.35)";
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Landmark dots
    for (const pt of coords) {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(254, 240, 138, 0.85)";
      ctx.shadowBlur = 6;
      ctx.shadowColor = "rgba(245, 158, 11, 0.8)";
      ctx.fill();
    }
  }
  ctx.restore();
}

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

// State Stabilization
const CHORD_HOLD_TIME_MS = 80;
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

function updateMeendGauge(meendCents) {
  if (distortionDisplayEl) {
    distortionDisplayEl.textContent = `${meendCents > 0 ? "+" : ""}${meendCents}¢`;
  }
  if (meendFillEl) {
    if (meendCents >= 0) {
      meendFillEl.style.left = "50%";
      meendFillEl.style.width = `${Math.min(50, (meendCents / 100) * 50)}%`;
    } else {
      const span = Math.min(50, (Math.abs(meendCents) / 100) * 50);
      meendFillEl.style.left = `${50 - span}%`;
      meendFillEl.style.width = `${span}%`;
    }
  }
}

// MediaPipe & Camera Setup
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

function resizeCanvas() {
  canvasEl.width = window.innerWidth;
  canvasEl.height = window.innerHeight;
}

// ---- Event Listeners ----
modeSelectEl.addEventListener("change", () => {
  currentMode = modeSelectEl.value;
  thaatGroupEl.style.display = currentMode === "indian" ? "flex" : "none";
  thaatRibbonEl.style.display = currentMode === "indian" ? "flex" : "none";
  updateThaatRibbon();
  updateGestureGuide();
});

thaatSelectEl.addEventListener("change", () => {
  currentThaatKey = thaatSelectEl.value;
  updateThaatRibbon();
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
  guideToggleEl.textContent = isHidden ? "Show Mudra Guide" : "Close Guide";
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

// Initialize UI Displays
updateThaatRibbon();
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
    let rawQualityIndex = 0;
    let rawSaptak = "madhya";
    let rawState = null;

    if (cachedLeftLandmarks) {
      if (currentMode === "indian") {
        rawItem = classifySwara(cachedLeftLandmarks, "Left", currentThaatKey);
      } else {
        rawItem = classifyWesternChord(cachedLeftLandmarks, "Left");
      }
    }

    let rightTilt = 0;
    let meendCents = 0;
    let currentVolume = 0;

    if (cachedRightLandmarks) {
      currentVolume = getVolumeFromHeight(cachedRightLandmarks);
      rawQualityIndex = getRightHandQualityIndex(cachedRightLandmarks);
      rawSaptak = getSaptak(cachedRightLandmarks, "Right");
      rightTilt = getHandHorizontalTilt(cachedRightLandmarks, "Right");
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

    // 4. Update HUD & Gauges
    updateVolumeMeter(currentVolume);
    updateMeendGauge(meendCents);
    highlightActiveSwaraChip(activeItem);

    if (activeItem) {
      if (currentMode === "indian") {
        const swaraObj = SWARAS[activeItem] || { hindi: activeItem, name: activeItem };
        swaraDevanagariEl.textContent = swaraObj.hindi;
        chordDisplayEl.textContent = `${swaraObj.name} • ${swaraObj.full || activeItem}`;

        const SAPTAK_LABELS = {
          mandra: "Mandra Saptak (मंद्र)",
          madhya: "Madhya Saptak (मध्य)",
          tar: "Tar Saptak (तार)"
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
        saptakIndicatorEl.textContent = activeSaptak === "mandra" ? "Lower Octave (-8ve)" : "Standard Octave";
        qualityDisplayEl.textContent = `Voicing Mode: ${activeQualityIndex}`;
      }
    } else {
      swaraDevanagariEl.textContent = "--";
      chordDisplayEl.textContent = "--";
      qualityDisplayEl.textContent = "Neutral";
      saptakIndicatorEl.textContent = "Madhya Saptak";
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

    // 6. Draw Sacred Geometric Chakra & Waves on Canvas
    drawChakraMandala(ctx, canvasEl.width, canvasEl.height, currentVolume, activeQualityIndex, rightTilt, activeItem);

    requestAnimationFrame(loop);
  }

  loop();
}

main().catch((err) => console.error("Application error:", err));
