// Push-Up Specific Types for Gymless

/**
 * Push-up pose keypoints from pose detection
 */
export interface PushUpPose {
    timestamp: number;

    // Shoulder positions (used for rep counting)
    leftShoulder: Keypoint;
    rightShoulder: Keypoint;

    // Elbow positions (used for form validation)
    leftElbow: Keypoint;
    rightElbow: Keypoint;

    // Wrist positions
    leftWrist: Keypoint;
    rightWrist: Keypoint;

    // Hip positions (used for body alignment)
    leftHip: Keypoint;
    rightHip: Keypoint;

    // Knee and ankle (for body line)
    leftKnee: Keypoint;
    rightKnee: Keypoint;
    leftAnkle: Keypoint;
    rightAnkle: Keypoint;

    // Head position
    nose: Keypoint;
}

/**
 * Individual keypoint from pose detection
 */
export interface Keypoint {
    x: number;
    y: number;
    z?: number;
    confidence: number;
}

/**
 * Push-up phase tracking
 */
export type PushUpPhase = 'up' | 'down' | 'transition';

/**
 * Form analysis result for a single frame
 */
export interface PushUpFormAnalysis {
    score: number; // 0-100
    phase: PushUpPhase;

    // Biomechanics
    leftElbowAngle: number;
    rightElbowAngle: number;
    bodyAlignment: number; // 0 = perfect plank, higher = sagging/piking
    shoulderDepth: number; // How low the shoulders are

    // Issues detected
    issues: FormIssue[];

    // Whether this rep should count
    isValidRep: boolean;
}

/**
 * Form issues that can be detected
 */
export interface FormIssue {
    type: 'elbow_flare' | 'hip_sag' | 'hip_pike' | 'incomplete_rom' | 'head_alignment' | 'uneven_shoulders';
    severity: 'low' | 'medium' | 'high';
    message: string;
}

/**
 * Rep data for a single completed push-up
 */
export interface PushUpRep {
    repNumber: number;
    formScore: number;
    duration: number; // milliseconds
    timestamp: number;
    phase: PushUpPhase;
}

/**
 * Set data for Quick Timer mode
 */
export interface PushUpSet {
    setNumber: number;
    reps: number;
    restDuration?: number; // seconds
    completedAt: number;
}

/**
 * Session summary
 */
export interface PushUpSession {
    mode: 'timer' | 'coach';
    sets: PushUpSet[];
    totalReps: number;
    averageFormScore?: number; // Only for coach mode
    duration: number; // total session time in seconds
    timestamp: number;
}

/**
 * Gemini coaching cue
 */
export interface CoachingCue {
    message: string;
    timestamp: number;
    priority: 'info' | 'warning' | 'critical';
}

/**
 * Voice coach personality types
 */
export type CoachPersonality = 'motivator' | 'technical' | 'zen';

/**
 * Timer mode settings
 */
export interface TimerSettings {
    targetReps: number;
    sets: number;
    restDuration: number; // seconds
}

/**
 * Coach mode settings
 */
export interface CoachSettings {
    targetReps: number;
    minFormScore: number; // Minimum score to count rep
    geminiEnabled: boolean;
    voiceEnabled: boolean;
    hapticsEnabled: boolean;
    personality: CoachPersonality;
}
