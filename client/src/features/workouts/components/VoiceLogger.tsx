"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Loader2, StopCircle } from 'lucide-react';
import { toast } from 'sonner';

interface VoiceLoggerProps {
  onParsedResult: (text: string) => void;
  isProcessing?: boolean;
}

export function VoiceLogger({ onParsedResult, isProcessing = false }: VoiceLoggerProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript("");
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            setTranscript(event.results[i][0].transcript);
          } else {
            interimTranscript += event.results[i][0].transcript;
            setTranscript(interimTranscript);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (event.error !== 'no-speech') {
          toast.error(`Mic error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        // Only trigger result if we actually captured something
        if (recognitionRef.current?.finalTranscript) {
           onParsedResult(recognitionRef.current.finalTranscript);
        }
      };

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
    }
    
    return () => {
        if (recognitionRef.current) {
            try { recognitionRef.current.abort(); } catch(e) {}
        }
    }
  }, [onParsedResult]);

  // Keep track of final transcript to use in onend
  useEffect(() => {
      if (recognitionRef.current) {
          recognitionRef.current.finalTranscript = transcript;
      }
  }, [transcript]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error("Start error", e);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2 select-none">
      <button
        onClick={toggleListening}
        disabled={isProcessing || !isSupported}
        className={`w-full h-11 border-2 font-pixel text-xs font-bold uppercase tracking-wider transition-all cursor-pointer active:translate-y-0.5 flex items-center justify-center gap-2 ${
          !isSupported
            ? "bg-[#1c1412] border-[#4a3830] text-stone-500 cursor-not-allowed"
            : isListening 
            ? "bg-[#b91c1c] border-[#ef4444] text-white animate-pulse" 
            : "bg-[#261914] border-[#5c4033] hover:border-[#f59e0b] text-[#f59e0b]"
        }`}
        style={{
          boxShadow: isListening 
            ? "inset 1px 1px 0 rgba(255,255,255,0.3), inset -1px -1px 0 rgba(0,0,0,0.6)"
            : "inset 1px 1px 0 rgba(255,255,255,0.1), inset -1px -1px 0 rgba(0,0,0,0.5)"
        }}
      >
        {!isSupported ? (
          <><Mic className="w-4 h-4 opacity-50" /> VOICE LOGGING UNSUPPORTED</>
        ) : isProcessing ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> PARSING COMMAND...</>
        ) : isListening ? (
          <><StopCircle className="w-4 h-4 text-white" /> [RECORDING] TAP TO STOP</>
        ) : (
          <><Mic className="w-4 h-4 text-[#f59e0b]" /> TAP TO DICTATE SET</>
        )}
      </button>

      {isListening && transcript && (
        <div className="w-full bg-[#0c0a09] p-2.5 border-2 border-[#5c4033] font-mono text-xs text-center text-[#f59e0b] animate-in fade-in">
          "{transcript}"
        </div>
      )}
    </div>
  );
}
