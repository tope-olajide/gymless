/**
 * Push-Up Biomechanics Utilities
 * Calculations specific to push-up form analysis
 */

import { Keypoint, PushUpPose } from '@/types';

/**
 * Calculate angle between three points (in degrees)
 * Used for elbow angles, etc.
 */
export function calculateAngle(
    point1: Keypoint,
    point2: Keypoint,  // vertex
    point3: Keypoint
): number {
    const radians = Math.atan2(point3.y - point2.y, point3.x - point2.x) -
        Math.atan2(point1.y - point2.y, point1.x - point2.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);

    if (angle > 180) {
        angle = 360 - angle;
    }

    return angle;
}

/**
 * Calculate elbow angles for push-up form
 */
export function calculateElbowAngles(pose: PushUpPose): { left: number; right: number } {
    const leftAngle = calculateAngle(
        pose.leftShoulder,
        pose.leftElbow,
        pose.leftWrist
    );

    const rightAngle = calculateAngle(
        pose.rightShoulder,
        pose.rightElbow,
        pose.rightWrist
    );

    return { left: leftAngle, right: rightAngle };
}

/**
 * Calculate body alignment (plank line quality)
 * Returns deviation from perfect plank (0 = perfect)
 */
export function calculateBodyAlignment(pose: PushUpPose): number {
    // Get midpoints
    const shoulderMidY = (pose.leftShoulder.y + pose.rightShoulder.y) / 2;
    const hipMidY = (pose.leftHip.y + pose.rightHip.y) / 2;
    const kneeMidY = (pose.leftKnee.y + pose.rightKnee.y) / 2;
    const ankleMidY = (pose.leftAnkle.y + pose.rightAnkle.y) / 2;

    // Calculate expected y-positions for perfect plank
    const shoulderToAnkleDist = ankleMidY - shoulderMidY;
    const expectedHipY = shoulderMidY + (shoulderToAnkleDist * 0.5);
    const expectedKneeY = shoulderMidY + (shoulderToAnkleDist * 0.7);

    // Calculate deviations
    const hipDeviation = Math.abs(hipMidY - expectedHipY);
    const kneeDeviation = Math.abs(kneeMidY - expectedKneeY);

    // Return total deviation (normalized)
    return (hipDeviation + kneeDeviation) / 2;
}

/**
 * Get average shoulder Y position (for rep counting)
 */
export function getShoulderDepth(pose: PushUpPose): number {
    return (pose.leftShoulder.y + pose.rightShoulder.y) / 2;
}

/**
 * Check if shoulders are level (no rotation)
 */
export function checkShoulderAlignment(pose: PushUpPose): {
    isAligned: boolean;
    difference: number;
} {
    const diff = Math.abs(pose.leftShoulder.y - pose.rightShoulder.y);
    const threshold = 0.05; // 5% of frame height

    return {
        isAligned: diff < threshold,
        difference: diff
    };
}

/**
 * Validate if pose has all required keypoints with good confidence
 */
export function isPoseValid(pose: PushUpPose, minConfidence: number = 0.5): boolean {
    const requiredKeypoints = [
        pose.leftShoulder,
        pose.rightShoulder,
        pose.leftElbow,
        pose.rightElbow,
        pose.leftWrist,
        pose.rightWrist,
        pose.leftHip,
        pose.rightHip,
    ];

    return requiredKeypoints.every(kp => kp.confidence >= minConfidence);
}

/**
 * Calculate range of motion (how low the push-up goes)
 * Returns percentage of full ROM (0-100)
 */
export function calculateRangeOfMotion(
    currentShoulderY: number,
    topShoulderY: number,
    bottomShoulderY: number
): number {
    const totalRange = bottomShoulderY - topShoulderY;
    const currentRange = currentShoulderY - topShoulderY;

    return Math.min(100, Math.max(0, (currentRange / totalRange) * 100));
}
