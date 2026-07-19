import React, { useEffect, useState } from 'react';
import { Terminal } from 'lucide-react';
import { useI18n } from '../../utils/i18n';

export const InitializationLoader = ({ message }) => {
  const [progress, setProgress] = useState(0);
  const [logIndex, setLogIndex] = useState(0);
  const { t } = useI18n();

  const logs = [
    'BOOTSTRAPPING CORE SYSTEMS ROUTERS...',
    'ESTABLISHING SECURE HANDSHAKE...',
    'VERIFYING AUTHENTICATION INTEGRITY...',
    'SYNCING TELEMETRY DATA LOGS...',
    'CONSTRUCTING GRAPHICAL USER INTERFACE...',
    'SYSTEM ONLINE. READY FOR USER INPUT.'
  ];

  const defaultMessage = message || 'SYSTEM INITIALIZATION IN PROGRESS';

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 4;
      });
    }, 35);

    const logInterval = setInterval(() => {
      setLogIndex((prev) => {
        if (prev < logs.length - 1) {
          return prev + 1;
        }
        clearInterval(logInterval);
        return prev;
      });
    }, 150);

    return () => {
      clearInterval(progressInterval);
      clearInterval(logInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-[#0B0F19] text-brand-primary flex flex-col items-center justify-center z-[9999] font-mono select-none">
      <div className="w-[90%] max-w-sm p-6 border border-brand-primary/20 bg-[#111827]/85 backdrop-blur-md rounded-xl shadow-[0_0_50px_rgba(6,182,212,0.12)] flex flex-col gap-4 relative overflow-hidden">
        {/* Corner telemetry tabs */}
        <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-brand-primary" />
        <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-brand-primary" />
        <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-brand-primary" />
        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-brand-primary" />

        <div className="flex items-center gap-2.5 border-b border-brand-border/20 pb-3">
          <Terminal className="text-brand-primary animate-pulse" size={14} />
          <span className="text-[9px] font-bold tracking-widest uppercase text-brand-main">{defaultMessage}</span>
        </div>

        {/* Diagnostic Logs */}
        <div className="flex flex-col gap-1.5 text-[8px] text-brand-sub h-24 overflow-hidden">
          {logs.slice(0, logIndex + 1).map((log, idx) => {
            const isLast = idx === logIndex;
            return (
              <div key={idx} className={`flex items-center gap-2 ${isLast && progress < 100 ? 'text-brand-primary' : 'text-brand-sub/50'}`}>
                <span>{idx < logIndex ? '✓' : '⚡'}</span>
                <span className="tracking-wider uppercase">{log}</span>
              </div>
            );
          })}
        </div>

        {/* Progress bar visual */}
        <div className="space-y-1.5 mt-2">
          <div className="flex justify-between items-center text-[7px] font-bold text-brand-sub">
            <span>[LOAD_PERCENTAGE]</span>
            <span className="text-brand-primary">{progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-[#1F2937] rounded-full overflow-hidden p-0.5 border border-brand-border/10">
            <div 
              className="h-full bg-brand-primary rounded-full transition-all duration-100 ease-out shadow-[0_0_8px_rgba(6,182,212,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
