'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AuditLog } from '@/types';
import { isFirebaseActive } from '@/lib/firebase';
import { Terminal as TerminalIcon } from 'lucide-react';

interface TerminalProps {
  logs: AuditLog[];
  className?: string;
  title?: string;
}

export default function Terminal({ logs, className = '', title = 'operation_center/logs' }: TerminalProps) {
  const terminalEndRef = useRef<HTMLDivElement | null>(null);
  const [typedCommand, setTypedCommand] = useState('');
  const [consoleOutputs, setConsoleOutputs] = useState<string[]>([]);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, consoleOutputs]);

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = typedCommand.trim().toLowerCase();
    if (!cmd) return;

    let output = '';
    if (cmd === 'help') {
      output = 'Available commands: sysinfo, clear, status, ping';
    } else if (cmd === 'sysinfo') {
      output = `SYSTEM: IEEE Zerone Core v1.0.0\nENVIRONMENT: ${isFirebaseActive ? 'FIREBASE_PROD' : 'SANDBOX_LOCAL'}\nENGINE: React 19 / Next.js 16\nTIME: ${new Date().toLocaleString()}`;
    } else if (cmd === 'clear') {
      setConsoleOutputs([]);
      setTypedCommand('');
      return;
    } else if (cmd === 'status') {
      output = 'status: ONLINE\ndb_connection: SUCCESS\nevent_mode: ACTIVE\nactive_threads: 16';
    } else if (cmd === 'ping') {
      output = 'pong! response time: 4ms';
    } else {
      output = `command not found: ${cmd}. type 'help' for suggestions.`;
    }

    setConsoleOutputs(prev => [...prev, `zerone_ops@terminal:~$ ${typedCommand}`, output]);
    setTypedCommand('');
  };

  return (
    <div className={`flex flex-col rounded-xl border border-[#3d3a39] bg-black font-mono text-xs text-green-400 shadow-2xl ${className}`}>
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between border-b border-[#3d3a39] bg-[#101010] px-4 py-2 text-[#a8a8a8]">
        <div className="flex items-center gap-2">
          <TerminalIcon className="h-4 w-4 text-[#00d992]" />
          <span className="font-semibold tracking-wider">{title}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff4d4d]/60"></span>
          <span className="h-2.5 w-2.5 rounded-full bg-[#00d4ff]/60"></span>
          <span className="h-2.5 w-2.5 rounded-full bg-[#00d992]/60"></span>
        </div>
      </div>

      {/* Terminal Display */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1.5 max-h-[350px] min-h-[200px]">
        {/* Connection status header */}
        <div className="text-gray-500 mb-2 border-b border-[#3d3a39]/40 pb-2">
          <p>IEEE ZERONE OPS STATION [Version 1.0.0]</p>
          <p>system_status: <span className="text-[#00d992] font-bold">ONLINE</span></p>
          <p>db_env: <span className="text-[#00d992] font-bold">{isFirebaseActive ? 'FIREBASE_CLOUD' : 'SANDBOX_LOCAL'}</span></p>
          <p>event_mode: <span className="text-primary font-bold">ACTIVE</span></p>
        </div>

        {/* Live logs */}
        {logs.length === 0 ? (
          <p className="text-gray-600 italic">No operational logs recorded.</p>
        ) : (
          [...logs].reverse().map((log) => {
            let typeColor = 'text-green-400';
            if (log.type === 'auth') typeColor = 'text-blue-400';
            if (log.type === 'team') typeColor = 'text-purple-400';
            if (log.type === 'event') typeColor = 'text-yellow-500';


            return (
              <div key={log.id} className={`${typeColor} leading-relaxed`}>
                {log.message}
              </div>
            );
          })
        )}

        {/* Console Command outputs */}
        {consoleOutputs.map((out, index) => (
          <div key={index} className="text-gray-300 whitespace-pre-line leading-relaxed">
            {out}
          </div>
        ))}

        <div ref={terminalEndRef} />
      </div>

      {/* Terminal Input Line */}
      <form onSubmit={handleCommandSubmit} className="flex border-t border-[#3d3a39] bg-[#0c0d0e] px-4 py-2">
        <span className="text-[#00d992] shrink-0 mr-2">zerone_ops@terminal:~$</span>
        <input
          type="text"
          value={typedCommand}
          onChange={(e) => setTypedCommand(e.target.value)}
          className="flex-1 bg-transparent text-gray-200 outline-none border-none caret-green-400 p-0 m-0"
          placeholder="type 'help' for core commands..."
          autoComplete="off"
          spellCheck="false"
        />
      </form>
    </div>
  );
}
