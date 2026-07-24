# Gemini Video Watermark Remover Desktop Application

A modern desktop application built to detect and remove Gemini, Google Veo, and AI-generated watermarks from videos of **any length** with low memory footprint and high processing speeds.

## Features

- **Unlimited Video Duration Support**: Uses streamed native FFmpeg process execution (`child_process`), keeping memory consumption constant (~50MB RAM) whether processing a 10-second clip or a 2-hour 4K video.
- **Interactive Watermark Bounding Box**: Drag & resize Region of Interest (ROI) bounding box directly on HTML5 video preview frame.
- **1-Click Gemini Presets**: Includes pre-calibrated coordinates for standard Gemini/Veo watermarks (Bottom-Right, Bottom-Left, Top-Right).
- **Multiple Removal Algorithms**:
  - **Delogo Filter**: Spatial boundary pixel interpolation (Fastest & Lossless feel).
  - **Gaussian Blur Mask**: Smooth blur overlay over logo area.
  - **Margin Crop**: Trims outer watermark area.
- **Hardware Acceleration**: Automatic GPU detection for NVIDIA NVENC, Intel QuickSync (QSV), or AMD AMF.
- **Lossless Audio Passthrough**: Copies original audio stream without re-encoding.
- **Batch Processing Queue**: Import and process multiple video files sequentially.
- **Standalone FFmpeg Engine**: Bundles static FFmpeg executable so users don't need manual PATH configuration.

## Architecture

```
src/
├── main/                   # Electron Main Process Architecture
│   ├── main.ts             # App lifecycle & IPC handlers
│   ├── preload.ts          # Safe ContextBridge IPC API
│   ├── services/
│   │   ├── ffmpeg/         # FFmpeg binary path resolver, prober, filter graphs, streaming engine
│   │   └── hardware/       # GPU hardware acceleration detector
│   └── ipc/                # Dialog & IPC channel implementations
├── shared/                 # Shared TypeScript interfaces & Gemini presets
└── renderer/               # React + Vite Frontend UI Architecture
    ├── context/            # Centralized Video Context State Manager
    └── components/         # Video Dropzone, Canvas ROI Selector, Control Panel, Batch Queue
```

## Getting Started

### Prerequisites
- Node.js v18+ & npm

### Development
```bash
npm run dev
```

### Production Build (.exe Installer)
```bash
npm run build
```
