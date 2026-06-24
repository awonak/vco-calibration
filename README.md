# VCO Calibration Studio

VCO Calibration Studio is a high-precision, low-latency web application designed to calibrate analog Voltage-Controlled Oscillators (VCOs) over a 5-octave register (C1-C5).

The app generates target reference pitches via the **Web MIDI API** to control your analog synthesizer, analyzes the synthesizer's audio output in real-time via the **Web Audio API**, and guides you through tuning your synth's coarse/fine pitch pots and volt-per-octave (V/Oct) tracking trimmer pots.

[https://vco-calibration.web.app](https://vco-calibration.web.app)

[Demo Video](https://youtu.be/DeOrSrbVILY)

## Key Features

* **High-Precision Pitch Tracker:** Zero-smoothed autocorrelation time-domain pitch detector with parabolic peak interpolation, achieving sub-Hz resolution. Optimized to track frequencies as low as $32.7\text{ Hz}$ (C1).
* **Oscilloscope Waveform:** Real-time 60fps 2D Canvas audio waveform visualizer.
* **Tuning Meter & Needle Gauge:** Visual feedback bar ranging from $-50\text{ cents}$ to $+50\text{ cents}$ with custom-adjustable lock tolerance (e.g., ±2 cents).
* **Interactive 5-Octave Progress Steps:** Interactive C1-C5 timeline nodes displaying locked states and target frequencies.
* **Octave Transition Logging:** Automatically captures the *initial* tracking error deviation when switching to a new octave, providing insights into the overall tracking curve.
* **MIDI Device Routing:** Continuous reference pitch gate triggers routed to any physical or virtual MIDI output port. Includes an emergency **Panic** button to silence stuck notes.
* **Audio Input Preview:** Gain-controlled, click-free audio monitoring to route the input signal directly to your speakers.

## Tech Stack

* **Frontend Framework:** React 19 (TypeScript)
* **Build System:** Vite
* **Core APIs:** Web Audio API, Web MIDI API
* **Styling:** CSS3 (Modern Glassmorphism Design System)
* **Hosting:** Firebase Hosting

## Developer Guide

### Prerequisites
* [Node.js](https://nodejs.org/) (v18+)
* An analog synthesizer with a pitch input (CV or MIDI) and an audio output.
* A MIDI interface (if your synth only accepts MIDI) or a CV interface (e.g. MIDI-to-CV converter) connected to your computer.
* A microphone or audio interface line-in connected to your computer to capture the synth's audio.

### 1. Installation
Clone the repository and install project dependencies:
```bash
npm install
```

### 2. Run Development Server
Start the local development server (Vite):
```bash
npm run dev
```
Open **[http://localhost:5173/](http://localhost:5173/)** in a browser that supports Web MIDI and Web Audio (e.g., Google Chrome, Microsoft Edge, Opera).

### 3. Build & Type-Check
Run TypeScript type-checking and compile the static bundle for production:
```bash
npm run build
```
The compiled output will be generated inside the `dist/` directory.

## Deployment to Firebase Hosting

This project is configured to deploy to Firebase Hosting on the project ID `vco-calibration`.

### Step 1: Login to Firebase
Authenticate the Firebase CLI in your terminal:
```bash
npx firebase-tools login
```

### Step 2: Build the Production Bundle
Ensure you compile the latest source files into the `dist/` folder:
```bash
npm run build
```

### Step 3: Deploy
Upload the static assets to Firebase Hosting:
```bash
npx firebase-tools deploy
```
Once completed, the CLI will output your public hosting URL (e.g., `https://vco-calibration.web.app`).

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
