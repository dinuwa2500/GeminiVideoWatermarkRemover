import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

let resolvedFfmpegPath: string | null = null;
let resolvedFfprobePath: string | null = null;

function normalizeBinaryPath(installerPath: string): string | null {
  if (!installerPath) return null;
  
  // Replace app.asar with app.asar.unpacked for production packaged apps
  const unpackedPath = installerPath.replace('app.asar', 'app.asar.unpacked');
  if (fs.existsSync(unpackedPath)) {
    return unpackedPath;
  }
  if (fs.existsSync(installerPath)) {
    return installerPath;
  }
  return null;
}

export function getFfmpegPath(): string {
  if (resolvedFfmpegPath && fs.existsSync(resolvedFfmpegPath)) {
    return resolvedFfmpegPath;
  }

  // 1. Try static installer dependency (@ffmpeg-installer/ffmpeg)
  try {
    const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
    const installerPath = ffmpegInstaller?.path;
    const norm = normalizeBinaryPath(installerPath);
    if (norm) {
      resolvedFfmpegPath = norm;
      return norm;
    }
  } catch (e) {
    // Ignore error, proceed to next fallback
  }

  // 2. Check packaged app resources directory
  if (process.resourcesPath) {
    const resPath = path.join(process.resourcesPath, 'ffmpeg.exe');
    if (fs.existsSync(resPath)) {
      resolvedFfmpegPath = resPath;
      return resPath;
    }
    const unpackedResPath = path.join(process.resourcesPath, 'app.asar.unpacked', 'node_modules', '@ffmpeg-installer', 'win32-x64', 'ffmpeg.exe');
    if (fs.existsSync(unpackedResPath)) {
      resolvedFfmpegPath = unpackedResPath;
      return unpackedResPath;
    }
  }

  // 3. Check system PATH
  try {
    execSync('ffmpeg -version', { stdio: 'ignore' });
    resolvedFfmpegPath = 'ffmpeg';
    return 'ffmpeg';
  } catch (e) {
    // Not in system path
  }

  // 4. Fallback search relative to app root
  const rootPath = path.join(__dirname, '../../node_modules/@ffmpeg-installer/win32-x64/ffmpeg.exe');
  if (fs.existsSync(rootPath)) {
    resolvedFfmpegPath = rootPath;
    return rootPath;
  }

  return 'ffmpeg'; // Final fallback
}

export function getFfprobePath(): string {
  if (resolvedFfprobePath && fs.existsSync(resolvedFfprobePath)) {
    return resolvedFfprobePath;
  }

  // 1. Try static installer dependency (@ffprobe-installer/ffprobe)
  try {
    const ffprobeInstaller = require('@ffprobe-installer/ffprobe');
    const installerPath = ffprobeInstaller?.path;
    const norm = normalizeBinaryPath(installerPath);
    if (norm) {
      resolvedFfprobePath = norm;
      return norm;
    }
  } catch (e) {
    // Ignore error
  }

  // 2. Check packaged app resources directory
  if (process.resourcesPath) {
    const resPath = path.join(process.resourcesPath, 'ffprobe.exe');
    if (fs.existsSync(resPath)) {
      resolvedFfprobePath = resPath;
      return resPath;
    }
    const unpackedResPath = path.join(process.resourcesPath, 'app.asar.unpacked', 'node_modules', '@ffprobe-installer', 'win32-x64', 'ffprobe.exe');
    if (fs.existsSync(unpackedResPath)) {
      resolvedFfprobePath = unpackedResPath;
      return unpackedResPath;
    }
  }

  // 3. Check system PATH
  try {
    execSync('ffprobe -version', { stdio: 'ignore' });
    resolvedFfprobePath = 'ffprobe';
    return 'ffprobe';
  } catch (e) {
    // Not in system path
  }

  // 4. Fallback search relative to app root
  const rootPath = path.join(__dirname, '../../node_modules/@ffprobe-installer/win32-x64/ffprobe.exe');
  if (fs.existsSync(rootPath)) {
    resolvedFfprobePath = rootPath;
    return rootPath;
  }

  return 'ffprobe';
}
