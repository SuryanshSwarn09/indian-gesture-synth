# NAADA • Indian Classical Gesture Synth (नाद)

A real-time, camera-based musical instrument that translates hand mudras, gestures, and wrist tilts into authentic Indian Classical Music (Hindustani & Carnatic)—featuring the 12 Swaras, 22 Shrutis Just Intonation, 10 parent Thaats, continuous microtonal Meend/Gamaka portamento, an algorithmic 4-string acoustic Tanpura drone, and a sacred geometric Harmonic Chakra canvas visualizer.

Built on top of the original [Gesture Synth](https://github.com/ericwei97-cloud/gesture-synth) concept by Eric Wei.

---

## 🌟 Key Features

### 1. Indian Music Theory & 22 Shrutis
- **12 Swaras**: Complete support for all 12 Svarasthanas (**सा, <u>रे</u>, रे, <u>ग</u>, ग, म, म॑, प, <u>ध</u>, ध, <u>नि</u>, नि**).
- **22 Shrutis Just Intonation**: Pure harmonic consonant ratios (e.g. $G = 5/4$, $P = 3/2$, $r = 16/15$, $M = 45/32$) alongside 12-TET Equal Temperament.
- **10 Parent Thaats**: Bilawal, Kalyan (Yaman), Khamaj, Kafi, Asavari, Bhairav, Bhairavi, Todi, Poorvi, and Marwa with smart default snapping.

### 2. Mudra & Expression Control
- **Left Hand (Swara & Mudra)**:
  - `1 Finger (Index)`: Sa (सा) - The root tonic
  - `2 Fingers (Index + Middle)`: Re (रे)
  - `3 Fingers (Index + Middle + Ring)`: Ga (ग)
  - `4 Fingers (Index, Middle, Ring, Pinky)`: Ma (म)
  - `5 Fingers (Open Palm)`: Pa (प) - Fifth (Achala)
  - `Index + Pinky`: Dha (ध)
  - `Index + Pinky + Thumb`: Ni (नि)
  - **Horizontal Wrist Tilt**: Center/Inward = Shuddha/Teevra, Outward = Komal (or Shuddha Ma for Teevra Thaats).
- **Right Hand (Meend, Saptak & Voicing)**:
  - **Wrist Elevation**: Volume / Swara Prana dynamics (Higher = Louder, Lower = Softer).
  - **Horizontal Wrist Tilt**: Continuous **Meend / Gamaka** microtonal pitch glide ($\pm 100$ cents) for fluid vocal/sitar portamento.
  - **Thumb Extended**: Drops to **Mandra Saptak** (lower octave).
  - **Elevated Hand**: Ascends to **Tar Saptak** (higher octave).
  - **Fingers**: 1 = Solo Melodic Swara; 2 = Swara + Sa drone; 3 = Swara + Sa + Pa; 4 = Swarmandal chord cascade.

### 3. Algorithmic 4-String Tanpura Studio
- Dedicated background synthesizer with realistic acoustic *Jwari* (buzzing bridge harmonic overtones) and meditative 4-step pluck sequencer.
- 4 interactive visual string wires in the HUD that vibrate when plucked.
- Selectable 1st string tuning (**Pa**, **Ma**, or **Ni**), volume slider, and on/off toggle.

### 4. Sacred Geometric Harmonic Chakra Visualizer
- Multi-layered 12-petal rotating mandala blooming in real-time with Swara harmonic frequencies.
- Expanding circular ripple waves radiating whenever Tanpura strings are plucked.
- Luminous hand skeleton tracking lines and glowing golden nodes.

### 5. Acoustic Timbres
- **Bansuri**: Soft triangle/sine blend with breath flutter and expressive vibrato LFO.
- **Sitar**: Sharp percussive pluck attack with metallic jawari formant resonance (1900Hz peak).
- **Harmonium**: Dual reed detuned oscillators with warm acoustic lowpass filter.
- **Warm / Bright Synths**: Triangle and sawtooth oscillators with soft-curve waveshaping.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- A modern web browser (Chrome, Edge, Brave, Firefox) with webcam access

### Installation & Run
```bash
# Clone the repository
git clone https://github.com/SuryanshSwarn09/indian-gesture-synth.git
cd indian-gesture-synth

# Install dependencies
npm install

# Start the local development server
npm run dev
```

Open `http://localhost:5173/` in your browser, click **"Click anywhere to begin"**, grant camera permissions, and start performing!

---

## 📜 Credits & License
- Original gesture-to-synth foundation created by [Eric Wei](https://indecisiveeric.com).
- Indian Classical adaptation, Thaat/Shruti engine, Tanpura studio, and Chakra visuals created by [Suryansh Swarn](https://github.com/SuryanshSwarn09).
- Free to use, modify, and share for educational and non-commercial purposes.
