import { useRef, useState, useCallback, useEffect } from "react";

export interface CameraState {
  isActive: boolean;
  error: string | null;
  facingMode: "user" | "environment";
}

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [state, setState] = useState<CameraState>({
    isActive: false,
    error: null,
    facingMode: "user",
  });

  const startCamera = useCallback(async (facingMode: "user" | "environment" = state.facingMode) => {
    try {
      // Stop existing stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setState({ isActive: true, error: null, facingMode });
    } catch (err: any) {
      const message =
        err.name === "NotAllowedError"
          ? "Camera permission denied. Please allow camera access."
          : err.name === "NotFoundError"
          ? "No camera found on this device."
          : `Camera error: ${err.message}`;
      setState((s) => ({ ...s, isActive: false, error: message }));
    }
  }, [state.facingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setState((s) => ({ ...s, isActive: false, error: null }));
  }, []);

  const captureFrame = useCallback((): ImageData | null => {
    const video = videoRef.current;
    if (!video || !state.isActive || video.readyState < 2) return null;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0);
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  }, [state.isActive]);

  const toggleFacingMode = useCallback(() => {
    const next = state.facingMode === "user" ? "environment" : "user";
    if (state.isActive) {
      startCamera(next);
    } else {
      setState((s) => ({ ...s, facingMode: next }));
    }
  }, [state.facingMode, state.isActive, startCamera]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return { videoRef, state, startCamera, stopCamera, captureFrame, toggleFacingMode };
}
