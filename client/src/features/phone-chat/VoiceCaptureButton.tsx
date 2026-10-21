"use client";

import { Mic, Square, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const MAX_RECORDING_SECONDS = 30;
const MAX_AUDIO_BYTES = 5 * 1024 * 1024;
const MIME_TYPES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus", "audio/ogg"];

export function VoiceCaptureButton({
  ready, busy, onSendAudio,
}: {
  ready: boolean;
  busy: boolean;
  onSendAudio: (audio: Blob, mimeType: string) => Promise<void>;
}) {
  const [recording, setRecording] = useState(false);
  const [sending, setSending] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [clip, setClip] = useState<Blob | null>(null);
  const [notice, setNotice] = useState("");
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const chunks = useRef<Blob[]>([]);
  const startedAt = useRef(0);
  const discardOnStop = useRef(false);
  const stoppedForBackground = useRef(false);
  const timer = useRef<number | null>(null);

  const stopTimer = useCallback(() => {
    if (timer.current !== null) window.clearInterval(timer.current);
    timer.current = null;
  }, []);
  const stopTracks = useCallback(() => {
    stream.current?.getTracks().forEach((track) => track.stop());
    stream.current = null;
  }, []);
  const stopRecording = useCallback(() => {
    stopTimer();
    if (recorder.current?.state === "recording") recorder.current.stop();
  }, [stopTimer]);

  useEffect(() => () => {
    stopTimer();
    if (recorder.current?.state === "recording") recorder.current.stop();
    stopTracks();
  }, [stopRecording, stopTimer, stopTracks]);

  useEffect(() => {
    if (!recording) return;
    const stopWhenHidden = () => {
      if (document.hidden) {
        stoppedForBackground.current = true;
        stopRecording();
        setNotice("Recording stopped when this page went to the background. Review before sending.");
      }
    };
    document.addEventListener("visibilitychange", stopWhenHidden);
    return () => document.removeEventListener("visibilitychange", stopWhenHidden);
  }, [recording, stopRecording]);

  useEffect(() => {
    if (!ready || busy) stopRecording();
  }, [ready, busy, stopRecording]);

  const start = async () => {
    discardOnStop.current = false;
    stoppedForBackground.current = false;
    setClip(null);
    setElapsed(0);
    setNotice("");
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setNotice("Audio recording is not supported here. You can still type your message.");
      return;
    }
    let acquired: MediaStream | null = null;
    try {
      acquired = await navigator.mediaDevices.getUserMedia({ audio: true });
      const preferred = MIME_TYPES.find((mime) => MediaRecorder.isTypeSupported(mime));
      const instance = preferred ? new MediaRecorder(acquired, { mimeType: preferred }) : new MediaRecorder(acquired);
      stream.current = acquired;
      recorder.current = instance;
      chunks.current = [];
      instance.ondataavailable = (event) => { if (event.data.size) chunks.current.push(event.data); };
      instance.onerror = () => {
        stopTimer(); stopTracks(); setRecording(false); setClip(null);
        setNotice("Recording failed. Check microphone permission or type your message.");
      };
      instance.onstop = () => {
        stopTimer(); stopTracks(); setRecording(false); recorder.current = null;
        const result = new Blob(chunks.current, { type: instance.mimeType || "audio/webm" });
        chunks.current = [];
        const stoppedInBackground = stoppedForBackground.current;
        stoppedForBackground.current = false;
        if (discardOnStop.current) { discardOnStop.current = false; setClip(null); return; }
        if (!result.size || result.size > MAX_AUDIO_BYTES) {
          setClip(null);
          setNotice(result.size > MAX_AUDIO_BYTES ? "Recording exceeds the 5 MiB upload limit." : "No audio was captured.");
          return;
        }
        setClip(result);
        setNotice(stoppedInBackground
          ? "Recording stopped when this page went to the background. Review before sending."
          : "Recording is held only in this tab. Send uploads it to Google Gemini for transcription.");
      };
      startedAt.current = Date.now();
      instance.start(250);
      setRecording(true);
      timer.current = window.setInterval(() => {
        const seconds = Math.min(MAX_RECORDING_SECONDS, Math.floor((Date.now() - startedAt.current) / 1000));
        setElapsed(seconds);
        if (seconds >= MAX_RECORDING_SECONDS) {
          setNotice("30-second limit reached. Review the recording before sending.");
          stopRecording();
        }
      }, 250);
    } catch (error) {
      acquired?.getTracks().forEach((track) => track.stop());
      const denied = error instanceof DOMException && error.name === "NotAllowedError";
      setNotice(denied ? "Microphone permission was denied. Allow it in browser settings or type your message." : "Microphone could not start. Check permission or type your message.");
    }
  };

  const cancel = () => {
    stopTimer();
    discardOnStop.current = true;
    if (recorder.current?.state === "recording") recorder.current.stop();
    stopTracks();
    chunks.current = [];
    setClip(null);
    setRecording(false);
    setNotice("Voice recording discarded.");
  };

  const send = async () => {
    if (!clip || sending || busy) return;
    setSending(true);
    try {
      await onSendAudio(clip, clip.type.split(";")[0].toLowerCase());
      setClip(null);
      setNotice("Voice request queued for Gemini transcription.");
    } catch {
      setNotice("Could not send the recording. It remains available to retry or discard.");
    } finally { setSending(false); }
  };

  return (
    <div className="flex min-w-[4.25rem] flex-col items-center gap-1">
      {!recording && !clip && (
        <button type="button" disabled={!ready || busy || sending} onClick={() => void start()} aria-label="Record voice message" title="Record a voice message" className="grid h-10 w-10 place-items-center border border-cyan-700/70 text-cyan-200 hover:bg-cyan-950/40 disabled:cursor-not-allowed disabled:opacity-40">
          <Mic aria-hidden="true" className="h-4 w-4" />
        </button>
      )}
      {recording && <div className="flex items-center gap-1">
        <button type="button" onClick={stopRecording} aria-label="Stop recording" title="Stop and review" className="grid h-10 w-10 place-items-center border border-rose-500/70 text-rose-200"><Square aria-hidden="true" className="h-4 w-4" /></button>
        <button type="button" onClick={cancel} aria-label="Discard recording" title="Discard recording" className="grid h-10 w-10 place-items-center border border-slate-700 text-slate-400"><X aria-hidden="true" className="h-4 w-4" /></button>
      </div>}
      {clip && <div className="flex items-center gap-1">
        <button type="button" disabled={!ready || busy || sending} onClick={() => void send()} aria-label="Send recording to Gemini" title="Send recording to Google Gemini" className="min-h-10 border border-emerald-500/60 px-2 font-mono text-[9px] text-emerald-200 disabled:opacity-40">{sending ? "SENDING" : "SEND VOICE"}</button>
        <button type="button" disabled={sending} onClick={cancel} aria-label="Discard recording" title="Discard recording" className="grid h-10 w-8 place-items-center border border-slate-700 text-slate-400"><X aria-hidden="true" className="h-4 w-4" /></button>
      </div>}
      <span aria-live="polite" className="font-mono text-[9px] tabular-nums text-slate-500">{recording ? `REC ${String(elapsed).padStart(2, "0")}s` : clip ? `${Math.ceil(clip.size / 1024)} KB` : "VOICE"}</span>
      {notice && <span role="status" className="sr-only">{notice}</span>}
    </div>
  );
}
