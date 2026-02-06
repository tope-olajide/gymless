/**
 * Web Camera Hook for Pose Detection
 * Manages camera setup and frame processing for web platform
 */

import { useEffect, useRef, useState } from 'react';
import { WebPoseDetector } from '@/services/pose/PoseDetector.web';
import { PushUpPose } from '@/types';

export function useWebCamera(
    isActive: boolean,
    onPoseDetected?: (pose: PushUpPose) => void
) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const detectorRef = useRef<WebPoseDetector | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initialize camera and detector
    useEffect(() => {
        let stream: MediaStream | null = null;

        const setup = async () => {
            try {
                // Get camera stream
                stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: 'user',
                        width: { ideal: 640 },
                        height: { ideal: 480 },
                    },
                });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();
                }

                // Initialize pose detector
                detectorRef.current = new WebPoseDetector();
                const initialized = await detectorRef.current.initialize();

                if (initialized) {
                    setIsReady(true);
                    console.log('✅ Camera and detector ready');
                } else {
                    setError('Failed to initialize pose detector');
                }
            } catch (err) {
                console.error('Camera setup error:', err);
                setError('Failed to access camera');
            }
        };

        setup();

        return () => {
            // Cleanup
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }

            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }

            if (detectorRef.current) {
                detectorRef.current.dispose();
            }
        };
    }, []);

    // Detection loop
    useEffect(() => {
        if (!isActive || !isReady || !videoRef.current || !detectorRef.current) {
            return;
        }

        const detect = async () => {
            if (!videoRef.current || !detectorRef.current) return;

            try {
                const pose = await detectorRef.current.detectPose(videoRef.current);

                if (pose && onPoseDetected) {
                    onPoseDetected(pose);
                }

                // Draw skeleton if canvas available
                if (canvasRef.current && pose) {
                    drawSkeleton(pose);
                }
            } catch (err) {
                console.error('Detection error:', err);
            }

            // Continue loop
            animationFrameRef.current = requestAnimationFrame(detect);
        };

        detect();

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isActive, isReady, onPoseDetected]);

    // Draw skeleton on canvas
    const drawSkeleton = (pose: PushUpPose) => {
        const canvas = canvasRef.current;
        const video = videoRef.current;

        if (!canvas || !video) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Match canvas size to video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Define connections for skeleton
        const connections = [
            // Torso
            ['leftShoulder', 'rightShoulder'],
            ['leftShoulder', 'leftHip'],
            ['rightShoulder', 'rightHip'],
            ['leftHip', 'rightHip'],

            // Left arm
            ['leftShoulder', 'leftElbow'],
            ['leftElbow', 'leftWrist'],

            // Right arm
            ['rightShoulder', 'rightElbow'],
            ['rightElbow', 'rightWrist'],

            // Left leg
            ['leftHip', 'leftKnee'],
            ['leftKnee', 'leftAnkle'],

            // Right leg
            ['rightHip', 'rightKnee'],
            ['rightKnee', 'rightAnkle'],
        ];

        // Draw connections
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 3;

        connections.forEach(([start, end]) => {
            const startPoint = pose[start as keyof PushUpPose] as any;
            const endPoint = pose[end as keyof PushUpPose] as any;

            if (startPoint.confidence > 0.5 && endPoint.confidence > 0.5) {
                ctx.beginPath();
                ctx.moveTo(startPoint.x, startPoint.y);
                ctx.lineTo(endPoint.x, endPoint.y);
                ctx.stroke();
            }
        });

        // Draw keypoints
        ctx.fillStyle = '#00ff88';
        Object.values(pose).forEach((keypoint: any) => {
            if (keypoint.confidence && keypoint.confidence > 0.5) {
                ctx.beginPath();
                ctx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
                ctx.fill();
            }
        });
    };

    return {
        videoRef,
        canvasRef,
        isReady,
        error,
    };
}
