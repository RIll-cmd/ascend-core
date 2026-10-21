// @vitest-environment happy-dom

import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { VoiceCaptureButton } from "./VoiceCaptureButton";

class FakeMediaRecorder {
  static isTypeSupported = vi.fn(() => true);
  static latest: FakeMediaRecorder | null = null;
  state: RecordingState = "inactive";
  mimeType: string;
  ondataavailable: ((event: { data: Blob }) => void) | null = null;
  onerror: (() => void) | null = null;
  onstop: (() => void) | null = null;

  constructor(_stream: MediaStream, options?: MediaRecorderOptions) {
    this.mimeType = options?.mimeType ?? "audio/webm";
    FakeMediaRecorder.latest = this;
  }

  start() { this.state = "recording"; }
  stop() { this.state = "inactive"; }
  completeStop(data = new Blob(["voice"], { type: this.mimeType })) {
    this.ondataavailable?.({ data });
    this.onstop?.();
  }
}

describe("VoiceCaptureButton", () => {
  let root: Root;
  let container: HTMLDivElement;
  let stopTrack: ReturnType<typeof vi.fn>;
  let onSendAudio: ReturnType<typeof vi.fn<(audio: Blob, mimeType: string) => Promise<void>>>;

  const renderButton = async (ready = true, busy = false) => {
    await act(async () => {
      root.render(createElement(VoiceCaptureButton, { ready, busy, onSendAudio }));
    });
  };
  const click = async (label: string) => {
    const button = [...container.querySelectorAll("button")].find((item) => item.getAttribute("aria-label") === label);
    if (!button) throw new Error(`Missing button: ${label}`);
    await act(async () => { button.click(); await Promise.resolve(); });
  };
  const finishRecording = (data?: Blob) => {
    const recorder = FakeMediaRecorder.latest;
    if (!recorder) throw new Error("Recorder was not created");
    act(() => { recorder.completeStop(data); });
  };

  beforeEach(() => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    stopTrack = vi.fn();
    onSendAudio = vi.fn<(audio: Blob, mimeType: string) => Promise<void>>().mockResolvedValue(undefined);
    FakeMediaRecorder.latest = null;
    FakeMediaRecorder.isTypeSupported.mockReset().mockReturnValue(true);
    vi.stubGlobal("MediaRecorder", FakeMediaRecorder);
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [{ stop: stopTrack }] }) },
    });
  });

  afterEach(async () => {
    await act(async () => { root.unmount(); });
    container.remove();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("records locally, previews before sending, and uploads only after Send", async () => {
    await renderButton();
    await click("Record voice message");
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true });
    expect(container.querySelector('[aria-label="Send recording to Gemini"]')).toBeNull();

    await click("Stop recording");
    finishRecording();
    expect(container.textContent).toContain("Recording is held only in this tab");
    expect(container.querySelector('[aria-label="Send recording to Gemini"]')).not.toBeNull();
    expect(onSendAudio).not.toHaveBeenCalled();

    await click("Send recording to Gemini");
    expect(onSendAudio).toHaveBeenCalledWith(expect.any(Blob), "audio/webm");
    expect(container.textContent).toContain("Voice request queued for Gemini transcription.");
    expect(stopTrack).toHaveBeenCalledOnce();
  });

  it("discards a recording without uploading it", async () => {
    await renderButton();
    await click("Record voice message");
    await click("Discard recording");
    finishRecording();

    expect(onSendAudio).not.toHaveBeenCalled();
    expect(container.querySelector('[aria-label="Send recording to Gemini"]')).toBeNull();
    expect(container.textContent).toContain("Voice recording discarded.");
    expect(stopTrack).toHaveBeenCalledOnce();
  });

  it("stops when the page becomes hidden and still requires explicit send", async () => {
    await renderButton();
    await click("Record voice message");
    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    await act(async () => { document.dispatchEvent(new Event("visibilitychange")); });
    finishRecording();

    expect(container.textContent).toContain("Recording stopped when this page went to the background");
    expect(container.querySelector('[aria-label="Send recording to Gemini"]')).not.toBeNull();
    expect(onSendAudio).not.toHaveBeenCalled();
    expect(stopTrack).toHaveBeenCalledOnce();
  });

  it("keeps the typed-chat fallback when microphone permission is denied", async () => {
    vi.mocked(navigator.mediaDevices.getUserMedia).mockRejectedValue(new DOMException("denied", "NotAllowedError"));
    await renderButton();
    await click("Record voice message");

    expect(container.textContent).toContain("Microphone permission was denied");
    expect(container.querySelector('[aria-label="Record voice message"]')).not.toBeNull();
    expect(onSendAudio).not.toHaveBeenCalled();
  });

  it("rejects clips over 5 MiB before showing a send action", async () => {
    await renderButton();
    await click("Record voice message");
    await click("Stop recording");
    finishRecording(new Blob([new Uint8Array(5 * 1024 * 1024 + 1)], { type: "audio/webm" }));

    expect(container.textContent).toContain("Recording exceeds the 5 MiB upload limit.");
    expect(container.querySelector('[aria-label="Send recording to Gemini"]')).toBeNull();
    expect(onSendAudio).not.toHaveBeenCalled();
  });
});
