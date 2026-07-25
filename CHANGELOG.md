# Changelog

All notable changes to the **Gemini Video Watermark Remover** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.2.3] - 2026-07-25

### 🚀 Added
- **Open Output Folder**: Click "Open Output Folder" on completion to instantly highlight and reveal saved video files directly in Windows File Explorer via Electron native shell API.
- **Native Window UI**: Removed top default Electron application menu bar (`File`, `Edit`, `View`, `Window`, `Help`) for a clean, modern borderless appearance.
- **Custom ROI Dimension Inputs**: Direct numerical pixel input controls for Width (W), Height (H), Position X, and Position Y of the watermark removal square.
- **Automated Release Descriptions**: Dynamic release changelog generator integrated into GitHub Actions release workflow.

## [1.1.0] - 2026-07-25

### 🚀 Added
- **Custom ROI Dimension Inputs**: Users can now directly enter exact pixel values for Width (W), Height (H), Position X, and Position Y for the watermark removal square.
- **Enhanced Preset Controls**: Preset selector automatically updates to "Custom Size" state when custom numerical dimensions are edited.

## [1.0.0] - 2026-07-24

### 🚀 Added
- **Streamed FFmpeg Core Engine**: Process videos of any length with fixed ~50MB RAM consumption.
- **AI Auto Watermark Detection**: Probes keyframe contrast and auto-positions the bounding box over Gemini/Veo logos.
- **Interactive HTML5 Canvas Bounding Box**: Drag and resize Region of Interest (ROI) selection mask.
- **Visually Lossless Output Mode (`-crf 16`)**: Zero quality degradation with bit-for-bit audio passthrough (`-c:a copy`).
- **Hardware Acceleration**: Automatic GPU encoder detection for NVIDIA NVENC and Intel QuickSync.
- **Batch Processing Queue**: Queue multiple videos for sequential watermark removal.
- **Dark Glassmorphism UI**: Built with React 18, Tailwind CSS, and Lucide icons.

### 🛡️ Security & Integrity
- Added SHA-256 checksum generation for release verification.
- Isolated Electron main process with strict IPC `contextBridge` isolation.
