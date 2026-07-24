import React, { useRef, useState, useEffect } from 'react';
import { useVideoContext } from '../../context/VideoContext';
import { Play, Pause, RotateCcw, Maximize2, Move } from 'lucide-react';

export const WatermarkCanvas: React.FC = () => {
  const { activeVideo, roiBox, setRoiBox, selectPreset } = useVideoContext();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Dragging state for ROI bounding box
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [initialBox, setInitialBox] = useState<{ x: number; y: number; w: number; h: number }>({ x: 0, y: 0, w: 0, h: 0 });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  if (!activeVideo) return null;

  // Calculate scaling factor from natural video resolution to container displayed size
  const videoWidth = activeVideo.width || 1920;
  const videoHeight = activeVideo.height || 1080;

  // Percentage bounds for overlay positioning
  const leftPct = (roiBox.x / videoWidth) * 100;
  const topPct = (roiBox.y / videoHeight) * 100;
  const widthPct = (roiBox.w / videoWidth) * 100;
  const heightPct = (roiBox.h / videoHeight) * 100;

  const handleMouseDownBox = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialBox({ ...roiBox });
    selectPreset('custom');
  };

  const handleMouseDownResize = (e: React.MouseEvent, handle: string) => {
    e.stopPropagation();
    setIsResizing(handle);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialBox({ ...roiBox });
    selectPreset('custom');
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const scaleX = videoWidth / rect.width;
    const scaleY = videoHeight / rect.height;

    const deltaX = (e.clientX - dragStart.x) * scaleX;
    const deltaY = (e.clientY - dragStart.y) * scaleY;

    if (isDragging) {
      const newX = Math.max(0, Math.min(videoWidth - initialBox.w, initialBox.x + deltaX));
      const newY = Math.max(0, Math.min(videoHeight - initialBox.h, initialBox.y + deltaY));
      setRoiBox({ ...roiBox, x: Math.round(newX), y: Math.round(newY) });
    } else if (isResizing) {
      let newW = initialBox.w;
      let newH = initialBox.h;

      if (isResizing.includes('r')) newW = Math.max(20, initialBox.w + deltaX);
      if (isResizing.includes('b')) newH = Math.max(20, initialBox.h + deltaY);

      setRoiBox({
        ...roiBox,
        w: Math.min(videoWidth - roiBox.x, Math.round(newW)),
        h: Math.min(videoHeight - roiBox.y, Math.round(newH))
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(null);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Convert Windows file path to file:// URL for HTML5 video element
  const videoSrc = activeVideo.filePath.startsWith('http') || activeVideo.filePath.startsWith('file://')
    ? activeVideo.filePath
    : `file:///${activeVideo.filePath.replace(/\\/g, '/')}`;

  return (
    <div className="flex flex-col h-full w-full bg-slate-950/80 rounded-2xl border border-slate-800 p-4 shadow-2xl relative overflow-hidden">
      {/* Top Frame Bar Info */}
      <div className="flex items-center justify-between pb-3 text-xs text-slate-400 border-b border-slate-800/80 mb-3">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-200 truncate max-w-xs">{activeVideo.fileName}</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 font-mono text-[11px] text-sky-400">
            {activeVideo.width}x{activeVideo.height} @ {activeVideo.fps} FPS
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span>Box: ({roiBox.x}, {roiBox.y}) [{roiBox.w}x{roiBox.h}px]</span>
        </div>
      </div>

      {/* Video Container & Canvas Bounding Box */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="relative flex-1 bg-black rounded-xl overflow-hidden flex items-center justify-center select-none"
      >
        <video
          ref={videoRef}
          src={videoSrc}
          className="max-w-full max-h-full object-contain pointer-events-none"
        />

        {/* Interactive Watermark Bounding Box Overlay */}
        <div
          onMouseDown={handleMouseDownBox}
          style={{
            left: `${leftPct}%`,
            top: `${topPct}%`,
            width: `${widthPct}%`,
            height: `${heightPct}%`
          }}
          className="absolute border-2 border-sky-400 bg-sky-500/20 backdrop-blur-[2px] cursor-move flex flex-col justify-between p-1 group shadow-lg shadow-sky-500/30 transition-shadow"
        >
          {/* Label Badge */}
          <div className="bg-sky-500 text-slate-950 text-[10px] font-bold font-mono px-1.5 py-0.5 rounded w-max flex items-center gap-1 shadow">
            <Move className="w-3 h-3" />
            WATERMARK MASK
          </div>

          {/* Resize Corner Handle */}
          <div
            onMouseDown={(e) => handleMouseDownResize(e, 'rb')}
            className="absolute bottom-0 right-0 w-4 h-4 bg-sky-400 border-2 border-white rounded-tl cursor-se-resize shadow-lg hover:scale-125 transition-transform"
          />
        </div>
      </div>

      {/* Playback Controls & Timeline Bar */}
      <div className="pt-3 flex items-center gap-4">
        <button
          onClick={togglePlay}
          className="w-9 h-9 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 flex items-center justify-center transition-all shadow-md shadow-sky-500/30 font-bold shrink-0"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>

        <span className="text-xs font-mono text-slate-400 w-12">{formatTime(currentTime)}</span>

        <input
          type="range"
          min="0"
          max={duration || 100}
          step="0.1"
          value={currentTime}
          onChange={handleSeek}
          className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
        />

        <span className="text-xs font-mono text-slate-400 w-12 text-right">{formatTime(duration)}</span>
      </div>
    </div>
  );
};
