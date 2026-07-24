import React from 'react';
import { VideoProvider, useVideoContext } from './context/VideoContext';
import { Header } from './components/common/Header';
import { VideoDropzone } from './components/editor/VideoDropzone';
import { WatermarkCanvas } from './components/editor/WatermarkCanvas';
import { PresetSelector } from './components/editor/PresetSelector';
import { ControlPanel } from './components/editor/ControlPanel';
import { StatusDashboard } from './components/progress/StatusDashboard';
import { BatchQueueList } from './components/batch/BatchQueueList';

const MainLayout: React.FC = () => {
  const { activeVideo, activeTab } = useVideoContext();

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      <Header />

      <main className="flex-1 p-6 overflow-hidden flex flex-col min-h-0">
        {activeTab === 'batch' ? (
          <BatchQueueList />
        ) : !activeVideo ? (
          <div className="flex-1 flex items-center justify-center">
            <VideoDropzone />
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
            {/* Left 8 columns: Canvas + Video Player + Progress Dashboard */}
            <div className="col-span-12 lg:col-span-8 flex flex-col min-h-0 gap-4">
              <StatusDashboard />
              <div className="flex-1 min-h-0">
                <WatermarkCanvas />
              </div>
            </div>

            {/* Right 4 columns: Presets & Controls */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 min-h-0 overflow-y-auto">
              <PresetSelector />
              <div className="flex-1 min-h-0">
                <ControlPanel />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <VideoProvider>
      <MainLayout />
    </VideoProvider>
  );
};

export default App;
