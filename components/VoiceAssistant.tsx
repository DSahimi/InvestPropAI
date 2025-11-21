import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Radio, X, Loader2 } from 'lucide-react';
import { connectLiveSession, pcmToBlob } from '../services/geminiService';

const VoiceAssistant: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopSession = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close(); 
      sessionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (inputContextRef.current) {
      inputContextRef.current.close();
      inputContextRef.current = null;
    }
    // Do not close output context to allow current audio to finish if desired, 
    // but for full stop we usually close it or suspend it.
    setIsActive(false);
    setIsConnecting(false);
    setIsPlaying(false);
  }, []);

  const handleAudioData = async (base64: string) => {
    if (!audioContextRef.current) return;
    
    setIsPlaying(true);
    const ctx = audioContextRef.current;
    
    // Decode
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // PCM to AudioBuffer
    const dataInt16 = new Int16Array(bytes.buffer);
    const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < channelData.length; i++) {
      channelData[i] = dataInt16[i] / 32768.0;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    
    const currentTime = ctx.currentTime;
    const startTime = Math.max(currentTime, nextStartTimeRef.current);
    source.start(startTime);
    nextStartTimeRef.current = startTime + buffer.duration;
    
    source.onended = () => {
       if (ctx.currentTime >= nextStartTimeRef.current) {
           setIsPlaying(false);
       }
    };
  };

  const startSession = async () => {
    setIsConnecting(true);
    try {
      // Setup Output
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      nextStartTimeRef.current = audioContextRef.current.currentTime;

      // Setup Input
      inputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Connect to Gemini
      const session = await connectLiveSession(handleAudioData, () => stopSession());
      sessionRef.current = session;

      // Start Streaming Input
      const inputCtx = inputContextRef.current;
      const source = inputCtx.createMediaStreamSource(stream);
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      
      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const blob = pcmToBlob(inputData);
        session.sendRealtimeInput({ media: blob });
      };

      source.connect(processor);
      processor.connect(inputCtx.destination); // Needed for chrome to fire event
      
      sourceRef.current = source;
      processorRef.current = processor;
      
      setIsActive(true);
    } catch (e) {
      console.error("Failed to start voice session", e);
      stopSession();
    } finally {
      setIsConnecting(false);
    }
  };

  const toggleSession = () => {
    if (isActive) {
      stopSession();
    } else {
      startSession();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => stopSession();
  }, [stopSession]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isActive && (
        <div className="absolute bottom-16 right-0 w-64 bg-white rounded-2xl shadow-xl p-4 mb-2 border border-indigo-100 transition-all animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-indigo-900 flex items-center gap-2">
              <Radio className={`w-4 h-4 ${isPlaying ? 'text-red-500 animate-pulse' : 'text-indigo-500'}`} />
              Gemini Live
            </h3>
            <button onClick={stopSession} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Listening... Ask me about cash flow, ROI, or the Austin market.
          </p>
          <div className="mt-3 flex gap-1 h-4 items-center justify-center">
             {/* Simple visualizer bars */}
             {[...Array(5)].map((_, i) => (
                <div key={i} className={`w-1 bg-indigo-500 rounded-full transition-all duration-100 ${isPlaying ? 'h-3 animate-bounce' : 'h-1'}`} style={{animationDelay: `${i * 0.1}s`}} />
             ))}
          </div>
        </div>
      )}
      
      <button
        onClick={toggleSession}
        disabled={isConnecting}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 focus:outline-none ${
          isActive 
            ? 'bg-red-500 text-white shadow-red-200' 
            : 'bg-indigo-600 text-white shadow-indigo-200'
        }`}
      >
        {isConnecting ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : isActive ? (
          <MicOff className="w-6 h-6" />
        ) : (
          <Mic className="w-6 h-6" />
        )}
      </button>
    </div>
  );
};

export default VoiceAssistant;
