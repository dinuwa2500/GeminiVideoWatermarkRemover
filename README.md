# Gemini Video Watermark Remover

A modern, high-performance desktop application to detect and remove Gemini, Google Veo, and AI-generated watermarks from videos of **any length** with hardware acceleration and zero quality loss.

<!-- App Preview -->
![App Preview](src/renderer/assets/logo.png)

## Features

- **Unlimited Video Duration** - Uses streamed native FFmpeg process execution (`child_process`), keeping memory consumption at a low constant (~50MB RAM) whether processing a 10-second clip or a 2-hour 4K video.
- **Interactive Bounding Box (ROI)** - Drag, drop, and resize Region of Interest (ROI) selection directly on an interactive HTML5 video preview canvas.
- **1-Click Gemini Presets** - Includes pre-calibrated coordinates for standard Gemini and Google Veo video watermarks (Bottom-Right, Bottom-Left, Top-Right).
- **Multiple Removal Algorithms**:
  - **Delogo Filter**: Spatial boundary pixel interpolation for a clean, visually seamless finish.
  - **Gaussian Blur Mask**: Smooth blur overlay tailored for logo areas.
  - **Margin Crop**: Precise edge cropping to remove outer watermark borders.
- **Hardware Acceleration** - Automatic GPU detection and encoding pipeline for NVIDIA NVENC, Intel QuickSync (QSV), and AMD AMF.
- **Lossless Audio Passthrough** - Direct audio stream copying (`-c:a copy`) with zero quality degradation or re-encoding delay.
- **Batch Processing Queue** - Import and process multiple video files sequentially with progress tracking and live status updates.
- **Zero Setup / Standalone Engine** - Bundles static FFmpeg & FFprobe executables so users do not need manual environment PATH configurations.

<!-- Before/After Preview -->
<!-- ![Comparison](artworks/comparison.png) -->

## Download

Download the latest production installer from the [Releases](https://github.com/dinuwa2500/GeminiVideoWatermarkRemover/releases) page.

| File | Description | Platform |
|------|-------------|----------|
| `GeminiVideoWatermarkRemover-Setup-1.0.0.exe` | Windows x64 Standalone Installer (NSIS) | Windows 10 / 11 (x64) |

## ⚠️ Disclaimer

> **USE AT YOUR OWN RISK**
>
> This tool modifies video files using FFmpeg filter graph processing. While designed to operate reliably and preserve original quality:
> - Variations in video encoding, container formats, or non-standard aspect ratios may affect output results
> - Large batch operations should be verified on a test clip first
>
> **Always back up your original video files before processing.**
>
> The author assumes no responsibility for any data loss, video corruption, or unintended modifications. By using this tool, you acknowledge that you understand these risks.

## Quick Start

<p align="center">
  <img src="src/renderer/assets/logo.png" alt="App Icon" width="160" height="160">
</p>

### Desktop GUI Workflow

1. Download `GeminiVideoWatermarkRemover-Setup-1.0.0.exe` from the [Releases](https://github.com/dinuwa2500/GeminiVideoWatermarkRemover/releases) page.
2. Run the installer and launch **Gemini Video Watermark Remover**.
3. Drag & drop your watermarked video into the app dropzone.
4. Choose a **Preset** (e.g., *Gemini Bottom-Right*) or drag the bounding box on the video canvas to cover the watermark.
5. Click **Process Video** — your clean video will be saved instantly.

## Usage & Processing Modes

### 1. Preset Mode (Recommended)

Select from built-in presets tuned specifically for Google Gemini and Veo AI-generated videos:

- **Gemini Bottom-Right**: Standard bottom-right logo location.
- **Gemini Bottom-Left**: Alternative bottom-left placement.
- **Veo Top-Right**: Google Veo watermark positioning.

### 2. Custom Interactive ROI Bounding Box

For non-standard watermark placements or custom videos:
1. Load the video into the preview canvas.
2. Drag and adjust the bounding box handle directly over the watermark area.
3. Fine-tune width, height, and coordinates using numerical input controls.

### 3. Removal Algorithms

Choose the optimal algorithm for your content:

| Algorithm | Method | Best Used For |
|-----------|--------|---------------|
| **Delogo** | Spatial pixel interpolation | Solid or semi-transparent corner logos (Visually seamless) |
| **Gaussian Blur** | Soft Gaussian blurring | Complex background areas or textured watermarks |
| **Margin Crop** | Outer border trimming | Watermarks located on extreme video edges |

### 4. Batch Processing Queue

1. Switch to the **Batch Queue** tab.
2. Drag and drop multiple videos or select a folder.
3. Apply preset or algorithm configuration across all items.
4. Click **Start Batch Processing** to execute sequential rendering.

## Supported Formats & Codecs

### Video Formats
- `.mp4`, `.mkv`, `.mov`, `.webm`, `.avi`, `.m4v`, `.flv`

### Hardware Encoders
- **NVIDIA**: `h264_nvenc`, `hevc_nvenc`
- **Intel**: `h264_qsv`, `hevc_qsv`
- **AMD**: `h264_amf`, `hevc_amf`
- **CPU Fallback**: `libx264` (Visually lossless `-crf 16`)

## Architecture

The project follows a clean, decoupled Electron + React architecture separating main-process system streams from renderer-process UI controls:

```
src/
├── main/                   # Electron Main Process Architecture
│   ├── main.ts             # Application lifecycle & IPC handlers
│   ├── preload.ts          # Secure ContextBridge API bridge
│   ├── services/
│   │   ├── ffmpeg/         # FFmpeg binary path resolver, prober, filter graphs & streaming engine
│   │   └── hardware/       # GPU hardware acceleration auto-detector
│   └── ipc/                # Dialogs & IPC channel handlers
├── shared/                 # Shared TypeScript interfaces & Gemini presets
└── renderer/               # React 18 + Vite + Tailwind CSS UI
    ├── context/            # Centralized Video Context State Manager
    └── components/         # Video Dropzone, Canvas ROI Selector, Control Panel & Batch Queue
```

### Technology Stack

- **Desktop Framework**: Electron 33
- **Frontend Core**: React 18 + TypeScript 5
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 3 + Lucide Icons
- **Media Engine**: Native FFmpeg Static Engine via Node `child_process`
- **Packaging**: Electron Builder (NSIS Windows Installer)

## Development & Build

### Prerequisites

- **Node.js**: v18 or v20+
- **Package Manager**: `pnpm` (recommended) or `npm`

### Setup Instructions

```bash
# 1. Clone the repository
git clone https://github.com/dinuwa2500/GeminiVideoWatermarkRemover.git
cd GeminiVideoWatermarkRemover

# 2. Install dependencies
pnpm install

# 3. Start development environment (Vite + Electron Hot Reload)
pnpm run dev
```

### Production Package (.exe)

```bash
# Compile TypeScript, bundle Vite assets, and build Windows installer
pnpm run build
```

The output executable will be created inside the `release/` directory.

## System Requirements

- **OS**: Windows 10 / 11 (x64)
- **RAM**: 4 GB minimum (App runtime consumes ~50 MB RAM)
- **Disk Space**: ~200 MB for application and bundled FFmpeg engine
- **GPU**: Optional NVIDIA, Intel, or AMD dedicated GPU for hardware acceleration

## Troubleshooting

### "The watermark area looks slightly blurred"
The **Delogo** algorithm interpolates edge pixels around the selected area. Ensure the ROI bounding box tightly fits the logo without extra padding.

### "GPU Acceleration Error"
If GPU encoding fails due to outdated drivers, the application automatically falls back to high-speed CPU encoding (`libx264`). Ensure graphics drivers are up to date.

### "Audio is missing in output video"
The application defaults to audio stream passthrough (`-c:a copy`). If your source video uses unsupported rare audio codecs, disable passthrough in settings to re-encode audio to AAC.

## Limitations

- Removes **visible watermarks** (e.g., Gemini logo overlay, Google Veo watermark).
- Does not modify invisible or steganographic watermark signals (such as SynthID watermarks embedded in pixel frequencies).

## Legal Disclaimer

This tool is provided for **personal and educational use only**.

The removal of watermarks may have legal implications depending on your jurisdiction and the intended use of the content. Users are solely responsible for ensuring their use of this tool complies with applicable laws, terms of service, and intellectual property rights.

The author does not condone or encourage the misuse of this tool for copyright infringement, misrepresentation, or any unlawful purposes.

**THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY CLAIM, DAMAGES, OR OTHER LIABILITY ARISING FROM THE USE OF THIS SOFTWARE.**

## License

This project is licensed under the [MIT License](LICENSE).

## Author

**Dinuwa** ([@dinuwa2500](https://github.com/dinuwa2500))

---

<p align="center">
  <i>If this tool helped you, consider giving it a ⭐</i>
</p>
