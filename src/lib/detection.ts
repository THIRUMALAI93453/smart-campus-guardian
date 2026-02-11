/**
 * Detection & Feature Extraction Module
 * Placeholder implementation — architecture supports plugging in a real ML model
 * (e.g., TensorFlow.js, ONNX Runtime, or remote API calls).
 */

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

let frameCounter = 0;

/**
 * Run detection on an ImageData frame.
 * This is a placeholder that generates realistic-looking detections
 * based on actual pixel analysis of the frame.
 * Replace the body of this function with a real ML model call.
 */
export function runDetection(frame: ImageData): DetectionResult {
  const start = performance.now();
  const { width, height, data } = frame;
  frameCounter++;

  // Analyze real pixel regions to generate context-aware detections
  const detections: Detection[] = [];
  const features: FeatureVector[] = [];

  // Scan grid regions for areas with significant edge/color variation
  const gridCols = 4;
  const gridRows = 3;
  const cellW = Math.floor(width / gridCols);
  const cellH = Math.floor(height / gridRows);

  const labels = ["person", "face", "hand", "phone", "notebook", "pen", "object"];

  for (let row = 0; row < gridRows; row++) {
    for (let col = 0; col < gridCols; col++) {
      const regionStats = analyzeRegion(data, width, col * cellW, row * cellH, cellW, cellH);

      // Only create detection if region has enough variance (something interesting)
      if (regionStats.edgeIntensity > 30 && regionStats.contrast > 15) {
        const id = `det_${frameCounter}_${row}_${col}`;
        const labelIdx = (row * gridCols + col + Math.floor(frameCounter / 10)) % labels.length;
        const confidence = Math.min(0.99, 0.5 + regionStats.edgeIntensity / 200 + regionStats.contrast / 200);

        // Tight bounding box within the cell
        const margin = 0.15;
        const bbox: BoundingBox = {
          x: col * cellW + cellW * margin,
          y: row * cellH + cellH * margin,
          width: cellW * (1 - 2 * margin),
          height: cellH * (1 - 2 * margin),
        };

        detections.push({ id, label: labels[labelIdx], confidence: parseFloat(confidence.toFixed(3)), bbox });

        features.push({
          detectionId: id,
          label: labels[labelIdx],
          edgeIntensity: parseFloat(regionStats.edgeIntensity.toFixed(2)),
          aspectRatio: parseFloat((bbox.width / bbox.height).toFixed(3)),
          area: Math.round(bbox.width * bbox.height),
          centroidX: parseFloat((bbox.x + bbox.width / 2).toFixed(1)),
          centroidY: parseFloat((bbox.y + bbox.height / 2).toFixed(1)),
          meanBrightness: parseFloat(regionStats.meanBrightness.toFixed(2)),
          contrast: parseFloat(regionStats.contrast.toFixed(2)),
          dominantHue: parseFloat(regionStats.dominantHue.toFixed(1)),
          keypointCount: Math.floor(regionStats.edgeIntensity / 5),
          textureDensity: parseFloat((regionStats.edgeIntensity / 100).toFixed(3)),
        });
      }
    }
  }

  // Keep top detections by confidence
  detections.sort((a, b) => b.confidence - a.confidence);
  const top = detections.slice(0, 6);
  const topIds = new Set(top.map((d) => d.id));

  return {
    detections: top,
    features: features.filter((f) => topIds.has(f.detectionId)),
    processingTimeMs: parseFloat((performance.now() - start).toFixed(2)),
    frameWidth: width,
    frameHeight: height,
  };
}

/** Analyze a rectangular region of pixel data for edge intensity, brightness, contrast, and hue */
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
  const step = 4; // sample every 4th pixel for speed

  for (let y = startY; y < startY + regionH; y += step) {
    for (let x = startX; x < startX + regionW; x += step) {
      const i = (y * imgWidth + x) * 4;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
      sumBrightness += brightness;
      sumSqBrightness += brightness * brightness;

      // Simple edge via neighbor difference
      if (x + step < startX + regionW && y + step < startY + regionH) {
        const ni = ((y + step) * imgWidth + (x + step)) * 4;
        const nb = 0.299 * data[ni] + 0.587 * data[ni + 1] + 0.114 * data[ni + 2];
        edgeSum += Math.abs(brightness - nb);
      }

      // Hue approximation
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

    // Box
    ctx.strokeStyle = det.confidence > 0.75 ? "#22c55e" : det.confidence > 0.6 ? "#eab308" : "#ef4444";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    // Label background
    const text = `${det.label} ${(det.confidence * 100).toFixed(0)}%`;
    ctx.font = "bold 12px monospace";
    const tm = ctx.measureText(text);
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fillRect(x, y - 18, tm.width + 8, 18);

    // Label text
    ctx.fillStyle = "#000";
    ctx.fillText(text, x + 4, y - 5);
  });
}
