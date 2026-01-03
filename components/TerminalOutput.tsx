
import React, { useEffect, useState, useRef } from 'react';

interface TerminalOutputProps {
  status: string;
  isActive: boolean;
}

const TerminalOutput: React.FC<TerminalOutputProps> = ({ status, isActive }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive && status) {
      setLogs(prev => [...prev.slice(-10), `> ${status}`]);
    } else if (!isActive) {
      setLogs([]);
    }
  }, [status, isActive]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  if (!isActive && logs.length === 0) return null;

  return (
    <div className="bg-black/80 border border-slate-700 rounded-lg p-3 font-mono text-xs text-green-400 mb-4 h-32 overflow-hidden relative">
      <div className="flex items-center gap-2 border-b border-slate-700 pb-1 mb-2">
        <div className="w-2 h-2 rounded-full bg-red-500"></div>
        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
        <div className="w-2 h-2 rounded-full bg-green-500"></div>
        <span className="text-slate-500 ml-2">Diagnostic Console</span>
      </div>
      <div ref={scrollRef} className="overflow-y-auto h-20 space-y-1">
        {logs.map((log, i) => (
          <div key={i} className="animate-pulse">
            {log}
          </div>
        ))}
        {isActive && <div className="animate-bounce">_</div>}
      </div>
    </div>
  );
};

export default TerminalOutput;
