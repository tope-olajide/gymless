import { PoseLandmark, PoseFrame } from '@/types/motion-capture';

export function calculateAngle(
  point1: PoseLandmark,
  point2: PoseLandmark,
  point3: PoseLandmark
): number {
  const radians =
    Math.atan2(point3.y - point2.y, point3.x - point2.x) -
    Math.atan2(point1.y - point2.y, point1.x - point2.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);

  if (angle > 180.0) {
    angle = 360 - angle;
  }

  return angle;
}

export function calculateDistance(
  point1: PoseLandmark,
  point2: PoseLandmark
): number {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  const dz = point2.z - point1.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function calculateMidpoint(
  point1: PoseLandmark,
  point2: PoseLandmark
): PoseLandmark {
  return {
    x: (point1.x + point2.x) / 2,
    y: (point1.y + point2.y) / 2,
    z: (point1.z + point2.z) / 2,
    visibility: Math.min(point1.visibility, point2.visibility),
  };
}

export function isPointAligned(
  point1: PoseLandmark,
  point2: PoseLandmark,
  point3: PoseLandmark,
  axis: 'x' | 'y' | 'z',
  tolerance: number
): boolean {
  const mid = (point1[axis] + point3[axis]) / 2;
  const deviation = Math.abs(point2[axis] - mid);
  const range = Math.abs(point3[axis] - point1[axis]);

  return deviation <= tolerance * range;
}

export function calculateSymmetry(
  leftPoint: PoseLandmark,
  rightPoint: PoseLandmark,
  axis: 'x' | 'y' | 'z'
): number {
  return Math.abs(leftPoint[axis] - rightPoint[axis]);
}

export function calculateVelocity(
  currentFrame: PoseFrame,
  previousFrame: PoseFrame,
  joint: string
): number {
  const current = (currentFrame.landmarks as any)[joint] as PoseLandmark;
  const previous = (previousFrame.landmarks as any)[joint] as PoseLandmark;

  const distance = calculateDistance(current, previous);
  const timeDelta = (currentFrame.timestamp - previousFrame.timestamp) / 1000;

  return distance / timeDelta;
}

export function calculateSmoothness(velocities: number[]): number {
  if (velocities.length < 2) return 1.0;

  let totalVariation = 0;
  for (let i = 1; i < velocities.length; i++) {
    totalVariation += Math.abs(velocities[i] - velocities[i - 1]);
  }

  const avgVelocity = velocities.reduce((a, b) => a + b, 0) / velocities.length;
  const smoothness = 1 - Math.min(totalVariation / (avgVelocity * velocities.length), 1);

  return smoothness;
}

export function getLandmark(frame: PoseFrame, jointName: string): PoseLandmark {
  return (frame.landmarks as any)[jointName] as PoseLandmark;
}

export function isLandmarkVisible(landmark: PoseLandmark, threshold: number = 0.5): boolean {
  return landmark.visibility >= threshold;
}

export function calculateTorsoAngle(frame: PoseFrame): number {
  const shoulder = calculateMidpoint(
    frame.landmarks.leftShoulder,
    frame.landmarks.rightShoulder
  );
  const hip = calculateMidpoint(frame.landmarks.leftHip, frame.landmarks.rightHip);

  const angle = Math.atan2(shoulder.y - hip.y, shoulder.x - hip.x) * (180 / Math.PI);
  return Math.abs(angle);
}

export function calculateHipDepth(frame: PoseFrame): number {
  const hip = calculateMidpoint(frame.landmarks.leftHip, frame.landmarks.rightHip);
  return hip.y;
}

export function calculateKneeAngle(frame: PoseFrame, side: 'left' | 'right'): number {
  const hip = frame.landmarks[`${side}Hip` as keyof typeof frame.landmarks];
  const knee = frame.landmarks[`${side}Knee` as keyof typeof frame.landmarks];
  const ankle = frame.landmarks[`${side}Ankle` as keyof typeof frame.landmarks];

  return calculateAngle(hip, knee, ankle);
}

export function calculateElbowAngle(frame: PoseFrame, side: 'left' | 'right'): number {
  const shoulder = frame.landmarks[`${side}Shoulder` as keyof typeof frame.landmarks];
  const elbow = frame.landmarks[`${side}Elbow` as keyof typeof frame.landmarks];
  const wrist = frame.landmarks[`${side}Wrist` as keyof typeof frame.landmarks];

  return calculateAngle(shoulder, elbow, wrist);
}

export function calculateHipAngle(frame: PoseFrame, side: 'left' | 'right'): number {
  const shoulder = frame.landmarks[`${side}Shoulder` as keyof typeof frame.landmarks];
  const hip = frame.landmarks[`${side}Hip` as keyof typeof frame.landmarks];
  const knee = frame.landmarks[`${side}Knee` as keyof typeof frame.landmarks];

  return calculateAngle(shoulder, hip, knee);
}

export function detectForwardLean(frame: PoseFrame): number {
  const nose = frame.landmarks.nose;
  const hip = calculateMidpoint(frame.landmarks.leftHip, frame.landmarks.rightHip);

  const horizontalDistance = Math.abs(nose.x - hip.x);
  return horizontalDistance;
}

export function detectKneeValgus(frame: PoseFrame, side: 'left' | 'right'): boolean {
  const knee = frame.landmarks[`${side}Knee` as keyof typeof frame.landmarks];
  const ankle = frame.landmarks[`${side}Ankle` as keyof typeof frame.landmarks];
  const hip = frame.landmarks[`${side}Hip` as keyof typeof frame.landmarks];

  const kneeAnkleDistance = Math.abs(knee.x - ankle.x);
  const hipAnkleDistance = Math.abs(hip.x - ankle.x);

  return kneeAnkleDistance > hipAnkleDistance * 1.1;
}
