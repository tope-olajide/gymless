import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WebPoseDetector } from '@/motion-capture/core/WebPoseDetector';
import { PoseFrame } from '@/types/motion-capture';

interface WebPoseComponentProps {
  onPoseDetected?: (pose: PoseFrame) => void;
  onCameraReady?: () => void;
  onError?: (error: string) => void;
  showSkeleton?: boolean;
  cameraType?: 'front' | 'back';
  style?: any;
}

export function WebPoseComponent({
  onPoseDetected,
  onCameraReady,
  onError,
  showSkeleton = true,
  cameraType = 'front',
  style,
}: WebPoseComponentProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const detectorRef = useRef<WebPoseDetector | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fps, setFps] = useState(0);

  const fpsCounterRef = useRef({ frames: 0, lastTime: Date.now() });

  useEffect(() => {
    initializeCamera();

    return () => {
      cleanup();
    };
  }, [cameraType]);

  const initializeCamera = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: cameraType === 'front' ? 'user' : 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30 },
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;

        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          initializeDetector();
        };
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to access camera';
      setError(errorMessage);
      onError?.(errorMessage);
      setIsLoading(false);
    }
  };

  const initializeDetector = async () => {
    try {
      const detector = new WebPoseDetector();
      const initialized = await detector.initialize();

      if (initialized) {
        detectorRef.current = detector;
        setIsLoading(false);
        onCameraReady?.();
        startDetectionLoop();
      } else {
        throw new Error('Failed to initialize pose detector');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to initialize detector';
      setError(errorMessage);
      onError?.(errorMessage);
      setIsLoading(false);
    }
  };

  const startDetectionLoop = () => {
    const detectFrame = async () => {
      if (
        !videoRef.current ||
        !detectorRef.current ||
        videoRef.current.readyState !== 4
      ) {
        animationFrameRef.current = requestAnimationFrame(detectFrame);
        return;
      }

      const pose = await detectorRef.current.detectPose(videoRef.current);

      if (pose) {
        onPoseDetected?.(pose);

        if (showSkeleton && canvasRef.current) {
          drawSkeleton(pose);
        }

        updateFPS();
      }

      animationFrameRef.current = requestAnimationFrame(detectFrame);
    };

    detectFrame();
  };

  const updateFPS = () => {
    const counter = fpsCounterRef.current;
    counter.frames++;

    const now = Date.now();
    const elapsed = now - counter.lastTime;

    if (elapsed >= 1000) {
      setFps(Math.round((counter.frames * 1000) / elapsed));
      counter.frames = 0;
      counter.lastTime = now;
    }
  };

  const drawSkeleton = (pose: PoseFrame) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const connections = [
      ['leftShoulder', 'rightShoulder'],
      ['leftShoulder', 'leftElbow'],
      ['leftElbow', 'leftWrist'],
      ['rightShoulder', 'rightElbow'],
      ['rightElbow', 'rightWrist'],
      ['leftShoulder', 'leftHip'],
      ['rightShoulder', 'rightHip'],
      ['leftHip', 'rightHip'],
      ['leftHip', 'leftKnee'],
      ['leftKnee', 'leftAnkle'],
      ['rightHip', 'rightKnee'],
      ['rightKnee', 'rightAnkle'],
    ];

    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 3;

    connections.forEach(([start, end]) => {
      const startPoint = pose.landmarks[start as keyof typeof pose.landmarks];
      const endPoint = pose.landmarks[end as keyof typeof pose.landmarks];

      if (
        startPoint &&
        endPoint &&
        startPoint.visibility > 0.5 &&
        endPoint.visibility > 0.5
      ) {
        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(endPoint.x, endPoint.y);
        ctx.stroke();
      }
    });

    ctx.fillStyle = '#ff0000';
    Object.values(pose.landmarks).forEach((landmark) => {
      if (landmark.visibility > 0.5) {
        ctx.beginPath();
        ctx.arc(landmark.x, landmark.y, 5, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  };

  const cleanup = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    if (detectorRef.current) {
      detectorRef.current.dispose();
    }
  };

  return (
    <View style={[styles.container, style]}>
      <video
        ref={(ref) => {
          videoRef.current = ref;
        }}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: cameraType === 'front' ? 'scaleX(-1)' : 'none',
        }}
        playsInline
        muted
      />

      {showSkeleton && (
        <canvas
          ref={(ref) => {
            canvasRef.current = ref;
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            transform: cameraType === 'front' ? 'scaleX(-1)' : 'none',
          }}
        />
      )}

      {isLoading && (
        <View style={styles.overlay}>
          <Text style={styles.overlayText}>Initializing camera...</Text>
        </View>
      )}

      {error && (
        <View style={styles.overlay}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      )}

      {!isLoading && !error && (
        <View style={styles.fpsContainer}>
          <Text style={styles.fpsText}>{fps} FPS</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    padding: 20,
  },
  fpsContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 8,
    borderRadius: 8,
  },
  fpsText: {
    color: '#00ff00',
    fontSize: 14,
    fontWeight: '600',
  },
});
