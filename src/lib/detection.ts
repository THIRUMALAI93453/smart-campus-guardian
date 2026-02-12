/**
 * Detection & Feature Extraction Module
 * Uses TensorFlow.js COCO-SSD for real object detection.
 */

import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Detection {
  id: string;
  label: string;
  confidence: number;
  bbox: BoundingBox;
}

export interface FeatureVector {
  detectionId: string;
  label: string;
  edgeIntensity: number;
  aspectRatio: number;
  area: number;
  centroidX: number;
  centroidY: number;
  meanBrightness: number;
  contrast: number;
  dominantHue: number;
  keypointCount: number;
  textureDensity: number;
}

export interface DetectionResult {
  detections: Detection[];
  features: FeatureVector[];
  processingTimeMs: number;
  frameWidth: number;
  frameHeight: number;
}

let model: cocoSsd.ObjectDetection | null = null;
let modelLoading = false;
let frameCounter = 0;

export async function loadModel(): Promise<void> {
  if (model || modelLoading) return;
  modelLoading = true;
  try {
    model = await cocoSsd.load({ base: "lite_mobilenet_v2" });
    console.log("COCO-SSD model loaded");
  } catch (err) {
    console.error("Failed to load COCO-SSD model:", err);
    throw err;
  } finally {
    modelLoading = false;
  }
}

export function isModelLoaded(): boolean {
  return model !== null;
}

/**
 * Run COCO-SSD detection on a video element or canvas.
 */
export async function runDetection(
  source: HTMLVideoElement | HTMLCanvasElement | ImageData
): Promise<DetectionResult> {
  const start = performance.now();
  frameCounter++;

  if (!model) {
    return { detections: [], features: [], processingTimeMs: 0, frameWidth: 0, frameHeight: 0 };
  }

  // Determine dimensions
  let width: number, height: number;
  let detectSource: HTMLVideoElement | HTMLCanvasElement;

  if (source instanceof ImageData) {
    const canvas = document.createElement("canvas");
    canvas.width = source.width;
    canvas.height = source.height;
    const ctx = canvas.getContext("2d")!;
    ctx.putImageData(source, 0, 0);
    detectSource = canvas;
    width = source.width;
    height = source.height;
  } else {
    detectSource = source;
    width = source instanceof HTMLVideoElement ? source.videoWidth : source.width;
    height = source instanceof HTMLVideoElement ? source.videoHeight : source.height;
  }

  if (width === 0 || height === 0) {
    return { detections: [], features: [], processingTimeMs: 0, frameWidth: width, frameHeight: height };
  }

  const predictions = await model.detect(detectSource, 10, 0.3);

  const detections: Detection[] = predictions.map((p, i) => ({
    id: `det_${frameCounter}_${i}`,
    label: p.class,
    confidence: parseFloat(p.score.toFixed(3)),
    bbox: {
      x: p.bbox[0],
      y: p.bbox[1],
      width: p.bbox[2],
      height: p.bbox[3],
    },
  }));

  // Extract features from each detection region
  const features: FeatureVector[] = [];
  // Get pixel data for feature extraction
  let pixelData: ImageData | null = null;
  try {
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = width;
    tempCanvas.height = height;
    const ctx = tempCanvas.getContext("2d")!;
    if (source instanceof ImageData) {
      ctx.putImageData(source, 0, 0);
    } else {
      ctx.drawImage(source, 0, 0);
    }
    pixelData = ctx.getImageData(0, 0, width, height);
  } catch {
    // Canvas tainted or other error — skip feature extraction
  }

  if (pixelData) {
    for (const det of detections) {
      const stats = analyzeRegion(
        pixelData.data,
        width,
        Math.max(0, Math.round(det.bbox.x)),
        Math.max(0, Math.round(det.bbox.y)),
        Math.min(Math.round(det.bbox.width), width),
        Math.min(Math.round(det.bbox.height), height)
      );

      features.push({
        detectionId: det.id,
        label: det.label,
        edgeIntensity: parseFloat(stats.edgeIntensity.toFixed(2)),
        aspectRatio: parseFloat((det.bbox.width / Math.max(det.bbox.height, 1)).toFixed(3)),
        area: Math.round(det.bbox.width * det.bbox.height),
        centroidX: parseFloat((det.bbox.x + det.bbox.width / 2).toFixed(1)),
        centroidY: parseFloat((det.bbox.y + det.bbox.height / 2).toFixed(1)),
        meanBrightness: parseFloat(stats.meanBrightness.toFixed(2)),
        contrast: parseFloat(stats.contrast.toFixed(2)),
        dominantHue: parseFloat(stats.dominantHue.toFixed(1)),
        keypointCount: Math.floor(stats.edgeIntensity / 5),
        textureDensity: parseFloat((stats.edgeIntensity / 100).toFixed(3)),
      });
    }
  }

  return {
    detections,
    features,
    processingTimeMs: parseFloat((performance.now() - start).toFixed(2)),
    frameWidth: width,
    frameHeight: height,
  };
}

/** Analyze a rectangular region for edge intensity, brightness, contrast, and hue */
function analyzeRegion(
  data: Uint8ClampedArray,
  imgWidth: number,
  startX: number,
  startY: number,
  regionW: number,
  regionH: number
) {
  let sumBrightness = 0;
  let sumSqBrightness = 0;
  let edgeSum = 0;
  let hueSum = 0;
  let count = 0;
  const step = 4;

  for (let y = startY; y < startY + regionH; y += step) {
    for (let x = startX; x < startX + regionW; x += step) {
      const i = (y * imgWidth + x) * 4;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
      sumBrightness += brightness;
      sumSqBrightness += brightness * brightness;

      if (x + step < startX + regionW && y + step < startY + regionH) {
        const ni = ((y + step) * imgWidth + (x + step)) * 4;
        const nb = 0.299 * data[ni] + 0.587 * data[ni + 1] + 0.114 * data[ni + 2];
        edgeSum += Math.abs(brightness - nb);
      }

      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      if (max - min > 10) {
        let hue = 0;
        if (max === r) hue = ((g - b) / (max - min)) * 60;
        else if (max === g) hue = (2 + (b - r) / (max - min)) * 60;
        else hue = (4 + (r - g) / (max - min)) * 60;
        if (hue < 0) hue += 360;
        hueSum += hue;
      }
      count++;
    }
  }

  const meanBrightness = count > 0 ? sumBrightness / count : 0;
  const variance = count > 0 ? sumSqBrightness / count - meanBrightness * meanBrightness : 0;
  const contrast = Math.sqrt(Math.max(0, variance));
  const edgeIntensity = count > 0 ? edgeSum / count : 0;
  const dominantHue = count > 0 ? hueSum / count : 0;

  return { meanBrightness, contrast, edgeIntensity, dominantHue };
}

/**
 * Draw detection overlays onto a canvas context.
 */
export function drawDetections(
  ctx: CanvasRenderingContext2D,
  detections: Detection[],
  scaleX: number,
  scaleY: number
) {
  detections.forEach((det) => {
    const x = det.bbox.x * scaleX;
    const y = det.bbox.y * scaleY;
    const w = det.bbox.width * scaleX;
    const h = det.bbox.height * scaleY;

    ctx.strokeStyle = det.confidence > 0.75 ? "#22c55e" : det.confidence > 0.6 ? "#eab308" : "#ef4444";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    const text = `${det.label} ${(det.confidence * 100).toFixed(0)}%`;
    ctx.font = "bold 12px monospace";
    const tm = ctx.measureText(text);
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fillRect(x, y - 18, tm.width + 8, 18);

    ctx.fillStyle = "#000";
    ctx.fillText(text, x + 4, y - 5);
  });
}
