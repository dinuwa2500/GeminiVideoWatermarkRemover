import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

let resolvedFfmpegPath: string | null = null;
let resolvedFfprobePath: string | null = null;

export function getFfmpegPath(): string {
  if (resolvedFfmpegPath && fs.existsSync(resolvedFfmpegPath)) {
    return resolvedFfmpegPath;
  }

  // 1. Try static installer dependency (@ffmpeg-installer/ffmpeg)
  try {
    const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
    const installerPath = ffmpegInstaller?.path;
    if (installerPath && typeof installerPath === 'string' && fs.existsSync(installerPath)) {
      resolvedFfmpegPath = installerPath;
      return installerPath;
    }
  } catch (e) {
    // Ignore error, proceed to fallback
  }

  // 2. Check system PATH
  try {
    execSync('ffmpeg -version', { stdio: 'ignore' });
    resolvedFfmpegPath = 'ffmpeg';
    return 'ffmpeg';
  } catch (e) {
    // Not in system path
  }

  // 3. Check packaged app resources path
  const appResourcesPath = path.join(process.resourcesPath || '', 'ffmpeg.exe');
  if (fs.existsSync(appResourcesPath)) {
    resolvedFfmpegPath = appResourcesPath;
    return appResourcesPath;
  }

  return 'ffmpeg'; // Default fallback
}

export function getFfprobePath(): string {
  if (resolvedFfprobePath && fs.existsSync(resolvedFfprobePath)) {
    return resolvedFfprobePath;
  }

  // 1. Try static installer dependency (@ffprobe-installer/ffprobe)
  try {
    const ffprobeInstaller = require('@ffprobe-installer/ffprobe');
    const installerPath = ffprobeInstaller?.path;
    if (installerPath && typeof installerPath === 'string' && fs.existsSync(installerPath)) {
      resolvedFfprobePath = installerPath;
      return installerPath;
    }
  } catch (e) {
    // Ignore error
  }

  // 2. Check system PATH
  try {
    execSync('ffprobe -version', { stdio: 'ignore' });
    resolvedFfprobePath = 'ffprobe';
    return 'ffprobe';
  } catch (e) {
    // Not in system path
  }

  return 'ffprobe';
}
