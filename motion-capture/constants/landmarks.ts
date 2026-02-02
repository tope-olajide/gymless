import { PoseLandmark, PoseFrame } from '@/types/motion-capture';

export const MediaPipeLandmarkIndices = {
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32,
} as const;

export const KeyJointsForExercises = {
  SHOULDERS: [
    MediaPipeLandmarkIndices.LEFT_SHOULDER,
    MediaPipeLandmarkIndices.RIGHT_SHOULDER,
  ],
  HIPS: [MediaPipeLandmarkIndices.LEFT_HIP, MediaPipeLandmarkIndices.RIGHT_HIP],
  KNEES: [
    MediaPipeLandmarkIndices.LEFT_KNEE,
    MediaPipeLandmarkIndices.RIGHT_KNEE,
  ],
  ANKLES: [
    MediaPipeLandmarkIndices.LEFT_ANKLE,
    MediaPipeLandmarkIndices.RIGHT_ANKLE,
  ],
  ELBOWS: [
    MediaPipeLandmarkIndices.LEFT_ELBOW,
    MediaPipeLandmarkIndices.RIGHT_ELBOW,
  ],
  WRISTS: [
    MediaPipeLandmarkIndices.LEFT_WRIST,
    MediaPipeLandmarkIndices.RIGHT_WRIST,
  ],
} as const;

export function convertMediaPipeLandmarksToFrame(
  landmarks: Array<{ x: number; y: number; z: number; visibility: number }>,
  timestamp: number
): PoseFrame {
  const getLandmark = (index: number): PoseLandmark => {
    const landmark = landmarks[index];
    return {
      x: landmark?.x ?? 0,
      y: landmark?.y ?? 0,
      z: landmark?.z ?? 0,
      visibility: landmark?.visibility ?? 0,
    };
  };

  return {
    timestamp,
    landmarks: {
      nose: getLandmark(MediaPipeLandmarkIndices.NOSE),
      leftEye: getLandmark(MediaPipeLandmarkIndices.LEFT_EYE),
      rightEye: getLandmark(MediaPipeLandmarkIndices.RIGHT_EYE),
      leftEar: getLandmark(MediaPipeLandmarkIndices.LEFT_EAR),
      rightEar: getLandmark(MediaPipeLandmarkIndices.RIGHT_EAR),
      leftShoulder: getLandmark(MediaPipeLandmarkIndices.LEFT_SHOULDER),
      rightShoulder: getLandmark(MediaPipeLandmarkIndices.RIGHT_SHOULDER),
      leftElbow: getLandmark(MediaPipeLandmarkIndices.LEFT_ELBOW),
      rightElbow: getLandmark(MediaPipeLandmarkIndices.RIGHT_ELBOW),
      leftWrist: getLandmark(MediaPipeLandmarkIndices.LEFT_WRIST),
      rightWrist: getLandmark(MediaPipeLandmarkIndices.RIGHT_WRIST),
      leftHip: getLandmark(MediaPipeLandmarkIndices.LEFT_HIP),
      rightHip: getLandmark(MediaPipeLandmarkIndices.RIGHT_HIP),
      leftKnee: getLandmark(MediaPipeLandmarkIndices.LEFT_KNEE),
      rightKnee: getLandmark(MediaPipeLandmarkIndices.RIGHT_KNEE),
      leftAnkle: getLandmark(MediaPipeLandmarkIndices.LEFT_ANKLE),
      rightAnkle: getLandmark(MediaPipeLandmarkIndices.RIGHT_ANKLE),
      leftHeel: getLandmark(MediaPipeLandmarkIndices.LEFT_HEEL),
      rightHeel: getLandmark(MediaPipeLandmarkIndices.RIGHT_HEEL),
      leftFootIndex: getLandmark(MediaPipeLandmarkIndices.LEFT_FOOT_INDEX),
      rightFootIndex: getLandmark(MediaPipeLandmarkIndices.RIGHT_FOOT_INDEX),
      leftPinky: getLandmark(MediaPipeLandmarkIndices.LEFT_PINKY),
      rightPinky: getLandmark(MediaPipeLandmarkIndices.RIGHT_PINKY),
      leftIndex: getLandmark(MediaPipeLandmarkIndices.LEFT_INDEX),
      rightIndex: getLandmark(MediaPipeLandmarkIndices.RIGHT_INDEX),
      leftThumb: getLandmark(MediaPipeLandmarkIndices.LEFT_THUMB),
      rightThumb: getLandmark(MediaPipeLandmarkIndices.RIGHT_THUMB),
    },
  };
}

export function isValidPose(pose: PoseFrame): boolean {
  const keyLandmarks = [
    pose.landmarks.leftShoulder,
    pose.landmarks.rightShoulder,
    pose.landmarks.leftHip,
    pose.landmarks.rightHip,
  ];

  return keyLandmarks.every((landmark) => landmark.visibility > 0.5);
}
