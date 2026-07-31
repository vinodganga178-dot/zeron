'use client';

import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import { QRScanResult } from '@/types';
import { parseQRCode, generateParticipantId } from '@/lib/qr';
import { Camera, QrCode, ShieldAlert, CheckCircle2, RefreshCw, X, Sparkles, Volume2 } from 'lucide-react';

interface QRScannerProps {
  onScanSuccess: (result: QRScanResult) => void;
  className?: string;
}

export default function QRScanner({ onScanSuccess, className = '' }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [lastScannedResult, setLastScannedResult] = useState<QRScanResult | null>(null);
  const [manualInput, setManualInput] = useState('');
  const [manualName, setManualName] = useState('');
  const [manualDept, setManualDept] = useState('');

  // Start webcam feed
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setIsScanning(true);
      }
    } catch (err: any) {
      setCameraError('Webcam permission denied or camera not available. Use manual simulator below.');
      setIsScanning(false);
    }
  };

  // Stop webcam feed
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  // Continuous frame analysis using jsQR
  useEffect(() => {
    let animationFrameId: number;

    const scanFrame = () => {
      if (
        isScanning &&
        videoRef.current &&
        videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA &&
        canvasRef.current
      ) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code && code.data) {
            try {
              const parsed = parseQRCode(code.data);
              setLastScannedResult(parsed);
              onScanSuccess(parsed);
              
              // Haptic feedback if supported
              if (typeof window !== 'undefined' && navigator.vibrate) {
                navigator.vibrate(100);
              }
            } catch (e) {
              // Ignore invalid frames until valid QR found
            }
          }
        }
      }

      if (isScanning) {
        animationFrameId = requestAnimationFrame(scanFrame);
      }
    };

    if (isScanning) {
      animationFrameId = requestAnimationFrame(scanFrame);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isScanning, onScanSuccess]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Handle manual code entry
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) return;

    const simulated: QRScanResult = {
      id: manualInput.trim() || generateParticipantId(),
      name: manualName.trim(),
      department: manualDept.trim() || 'General',
    };

    setLastScannedResult(simulated);
    onScanSuccess(simulated);
    setManualInput('');
    setManualName('');
    setManualDept('');
  };

  // Quick Preset Simulator Buttons for testing without camera
  const triggerPresetScan = (name: string, dept: string) => {
    const preset: QRScanResult = {
      id: generateParticipantId(),
      name,
      department: dept,
    };
    setLastScannedResult(preset);
    onScanSuccess(preset);
  };

  return (
    <div className={`rounded-2xl border border-[#2a2a2a] bg-[#111] p-6 space-y-6 font-mono ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#222] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00e5ff]/10 border border-[#00e5ff]/30 text-[#00e5ff]">
            <QrCode className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase">Participant QR Code Scanner</h3>
            <p className="text-[10px] text-[#666]">Live Camera Feed & Manual Simulator</p>
          </div>
        </div>

        {isScanning ? (
          <button
            onClick={stopCamera}
            className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold px-3 py-1.5 rounded-lg text-xs transition-all"
          >
            <X className="h-3.5 w-3.5" /> Stop Camera
          </button>
        ) : (
          <button
            onClick={startCamera}
            className="flex items-center gap-1.5 bg-[#00e5ff] hover:bg-[#00c8e0] text-black font-bold px-4 py-1.5 rounded-lg text-xs transition-all shadow-[0_0_15px_rgba(0,229,255,0.3)]"
          >
            <Camera className="h-3.5 w-3.5" /> Start Live Scanner
          </button>
        )}
      </div>

      {/* Camera Video / Viewfinder Area */}
      {isScanning ? (
        <div className="relative rounded-2xl overflow-hidden border-2 border-[#00e5ff]/40 bg-black aspect-video flex items-center justify-center shadow-2xl">
          <video ref={videoRef} className="w-full h-full object-cover" />
          <canvas ref={canvasRef} className="hidden" />

          {/* Target Reticle Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative h-48 w-48 border-2 border-dashed border-[#00e5ff] rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(0,229,255,0.4)]">
              {/* Laser animation */}
              <div className="absolute inset-x-0 top-0 h-1 bg-[#00e5ff] animate-[ping_2s_infinite] opacity-75" />
              <span className="text-[10px] text-[#00e5ff] font-bold uppercase bg-black/60 px-2 py-0.5 rounded">
                Align QR Code
              </span>
            </div>
          </div>
        </div>
      ) : cameraError ? (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>{cameraError}</span>
        </div>
      ) : null}

      {/* Last Scanned Feedback Toast */}
      {lastScannedResult && (
        <div className="p-3.5 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <div>
              <span className="font-bold text-white">{lastScannedResult.name}</span>
              <span className="text-[10px] text-green-300 ml-2">({lastScannedResult.department})</span>
              <div className="text-[10px] text-[#888]">ID: {lastScannedResult.id}</div>
            </div>
          </div>
          <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded font-bold uppercase">Scanned ✓</span>
        </div>
      )}

      {/* Manual Input Simulator */}
      <div className="space-y-3 pt-2 border-t border-[#222]">
        <div className="text-[10px] font-bold text-[#888] uppercase tracking-wider">Manual Entry / Quick Testing</div>
        <form onSubmit={handleManualSubmit} className="space-y-3 text-xs">
          <div>
            <label className="text-[10px] text-[#8b949e] uppercase block mb-1">Participant Name *</label>
            <input
              type="text"
              value={manualName}
              onChange={(e) => setManualName(e.target.value)}
              required
              placeholder="e.g. Arun Kumar"
              className="w-full bg-[#1a1a1a] border border-[#3d3a39] rounded-xl px-3.5 py-2.5 text-white placeholder-gray-500 focus:border-[#00d992] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-[#8b949e] uppercase block mb-1">QR ID Code (Optional)</label>
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Auto-generated if empty"
                className="w-full bg-[#1a1a1a] border border-[#3d3a39] rounded-xl px-3.5 py-2.5 text-white placeholder-gray-500 focus:border-[#00d992] outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-[#8b949e] uppercase block mb-1">Department</label>
              <input
                type="text"
                value={manualDept}
                onChange={(e) => setManualDept(e.target.value)}
                placeholder="e.g. CSE"
                className="w-full bg-[#1a1a1a] border border-[#3d3a39] rounded-xl px-3.5 py-2.5 text-white placeholder-gray-500 focus:border-[#00d992] outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#1a1a1a] hover:bg-[#3d3a39] border border-[#3d3a39] text-[#00d992] hover:text-white font-bold py-2.5 rounded-xl text-xs transition-all"
          >
            + Add Participant to Queue
          </button>
        </form>

        {/* Quick Demo Test Buttons */}
        <div className="pt-2">
          <div className="text-[10px] text-[#8b949e] uppercase mb-1.5 font-bold">Quick Demo Scan Simulators:</div>
          <div className="flex flex-wrap gap-1.5 text-[10px]">
            {[
              { name: 'Rahul Sharma', dept: 'CSE' },
              { name: 'Ananya Verma', dept: 'ECE' },
              { name: 'Vikram Menon', dept: 'ME' },
              { name: 'Priya Patel', dept: 'EEE' },
            ].map((demo) => (
              <button
                key={demo.name}
                type="button"
                onClick={() => triggerPresetScan(demo.name, demo.dept)}
                className="bg-[#1a1a1a] hover:bg-[#3d3a39] border border-[#3d3a39] hover:border-[#00d992]/50 text-[#8b949e] hover:text-white px-2.5 py-1 rounded-lg transition-all"
              >
                + Scan {demo.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
