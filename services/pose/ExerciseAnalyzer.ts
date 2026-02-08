/**
 * Extensible Exercise Analyzer for Gymless
 * 
 * Provides pose analysis for ANY exercise based on its configuration.
 * Replaces the hardcoded push-up analyzer with a data-driven system.
 */

import { AngleCheck, Exercise, ExercisePhase, getExerciseById } from '../../data/exercises';

// Landmark positions for angle calculation
export interface LandmarkPosition {
    x: number;
    y: number;
    z?: number;
    visibility?: number;
}

export interface PoseData {
    landmarks: Record<string, LandmarkPosition>;
    timestamp: number;
}

export interface FormFeedback {
    isCorrect: boolean;
    message: string;
    severity: 'info' | 'warning' | 'error';
    jointId?: string;
}

export interface PhaseResult {
    phase: ExercisePhase;
    confidence: number;
    formFeedback: FormFeedback[];
    formScore: number; // 0-100
}

export interface RepResult {
    repNumber: number;
    formScore: number;
    duration: number;
    feedback: string[];
}

export interface AnalysisSession {
    exerciseId: string;
    startTime: number;
    currentPhase: ExercisePhase;
    lastPhase: ExercisePhase | null;
    repCount: number;
    reps: RepResult[];
    currentRepStartTime: number;
    formScores: number[];
    holdStartTime?: number;
    readyToCountRep: boolean; // Two-stage gate: must be in 'down' before counting
    // Phase debouncing - prevents flickering
    phaseStableFrames: number; // Frames phase has been stable
    confirmedPhase: ExercisePhase; // Only changes after debounce
    phaseJustChanged: boolean; // True on frame where phase transitions
    // Hysteresis - prevents signal jitter
    lastRepTime: number; // Cooldown after rep
    lowestAngle: number; // Track lowest angle reached in current cycle
    // Velocity & Robustness
    lastY: number; // Previous Y-position of a key joint (e.g., hip)
    velocity: number; // Current vertical velocity
    lastPhaseChangeTime: number; // Timestamp of last confirmed phase change
}

/**
 * Calculate angle between three points (angle at middle point)
 */
export function calculateAngle(
    p1: LandmarkPosition,
    vertex: LandmarkPosition,
    p2: LandmarkPosition
): number {
    const radians =
        Math.atan2(p2.y - vertex.y, p2.x - vertex.x) -
        Math.atan2(p1.y - vertex.y, p1.x - vertex.x);

    let angle = Math.abs(radians * (180 / Math.PI));

    if (angle > 180) {
        angle = 360 - angle;
    }

    return angle;
}

/**
 * Check if all required landmarks are visible
 */
export function hasRequiredLandmarks(
    pose: PoseData,
    requiredLandmarks: string[],
    minVisibility: number = 0.5
): boolean {
    return requiredLandmarks.every((landmark) => {
        const lm = pose.landmarks[landmark];
        return lm && (lm.visibility ?? 1) >= minVisibility;
    });
}

/**
 * Main Exercise Analyzer Class
 */
export class ExerciseAnalyzer {
    private exercise: Exercise;
    private session: AnalysisSession;

    constructor(exerciseId: string) {
        const exercise = getExerciseById(exerciseId);
        if (!exercise) {
            throw new Error(`Exercise not found: ${exerciseId}`);
        }

        this.exercise = exercise;
        this.session = {
            exerciseId,
            startTime: Date.now(),
            currentPhase: 'start',
            lastPhase: null,
            repCount: 0,
            reps: [],
            currentRepStartTime: Date.now(),
            formScores: [],
            readyToCountRep: false,
            // Phase debouncing init
            phaseStableFrames: 0,
            confirmedPhase: 'start',
            phaseJustChanged: false,
            // Hysteresis init
            lastRepTime: 0,
            lowestAngle: 180,
            lastY: 0,
            velocity: 0,
            lastPhaseChangeTime: Date.now(),
        };
    }

    /**
     * Get the current exercise being analyzed
     */
    getExercise(): Exercise {
        return this.exercise;
    }

    /**
     * Get current session stats
     */
    getSessionStats(): {
        repCount: number;
        averageFormScore: number;
        currentPhase: ExercisePhase;
        elapsedSeconds: number;
    } {
        const avgScore = this.session.formScores.length > 0
            ? this.session.formScores.reduce((a, b) => a + b, 0) / this.session.formScores.length
            : 100;

        return {
            repCount: this.session.repCount,
            averageFormScore: Math.round(avgScore),
            currentPhase: this.session.currentPhase,
            elapsedSeconds: Math.round((Date.now() - this.session.startTime) / 1000),
        };
    }

    /**
     * Get current vertical velocity
     */
    getVelocity(): number {
        return this.session.velocity;
    }

    /**
     * Check form for a specific angle check
     */
    private checkAngle(pose: PoseData, check: AngleCheck): FormFeedback {
        const joint = pose.landmarks[check.joint];
        const connected1 = pose.landmarks[check.connectedTo[0]];
        const connected2 = pose.landmarks[check.connectedTo[1]];

        if (!joint || !connected1 || !connected2) {
            return {
                isCorrect: true, // Can't check if landmarks missing
                message: '',
                severity: 'info',
            };
        }

        const angle = calculateAngle(connected1, joint, connected2);
        const isCorrect = angle >= check.minAngle && angle <= check.maxAngle;

        return {
            isCorrect,
            message: isCorrect ? '' : check.feedbackIfWrong,
            severity: isCorrect ? 'info' : 'warning',
            jointId: check.joint,
        };
    }

    /**
     * Detect current phase based on pose
     */
    private detectPhase(pose: PoseData): { phase: ExercisePhase; confidence: number } {
        let bestPhase: ExercisePhase = 'start';
        let bestConfidence = 0;

        for (const phaseDef of this.exercise.phases) {
            if (phaseDef.angleChecks.length === 0) {
                // No angle checks = can't auto-detect this phase
                continue;
            }

            let matches = 0;
            let total = phaseDef.angleChecks.length;

            for (const check of phaseDef.angleChecks) {
                if (check.phase !== phaseDef.name) continue;

                const joint = pose.landmarks[check.joint];
                const connected1 = pose.landmarks[check.connectedTo[0]];
                const connected2 = pose.landmarks[check.connectedTo[1]];

                if (joint && connected1 && connected2) {
                    const angle = calculateAngle(connected1, joint, connected2);
                    if (angle >= check.minAngle && angle <= check.maxAngle) {
                        matches++;
                    }
                }
            }

            const confidence = total > 0 ? matches / total : 0;
            if (confidence > bestConfidence) {
                bestConfidence = confidence;
                bestPhase = phaseDef.name;
            }
        }

        return { phase: bestPhase, confidence: bestConfidence };
    }

    /**
     * Analyze a single pose frame
     */
    analyze(pose: PoseData): PhaseResult & { repCompleted: boolean; holdSeconds?: number; phaseJustChanged: boolean; isArmed: boolean } {
        // Track rep count before analysis to detect actual rep completion
        const repCountBefore = this.session.repCount;

        // Check if we have required landmarks
        if (!hasRequiredLandmarks(pose, this.exercise.requiredLandmarks as string[])) {
            return {
                phase: this.session.confirmedPhase,
                confidence: 0,
                formFeedback: [{
                    isCorrect: false,
                    message: 'Position yourself so your full body is visible',
                    severity: 'warning',
                }],
                formScore: 0,
                repCompleted: false,
                phaseJustChanged: false,
                isArmed: this.session.readyToCountRep,
            };
        }

        // Detect current phase
        const { phase, confidence } = this.detectPhase(pose);

        // Get form feedback for current phase
        const formFeedback: FormFeedback[] = [];
        let formScore = 100;

        const currentPhaseDef = this.exercise.phases.find((p) => p.name === phase);
        if (currentPhaseDef) {
            for (const check of currentPhaseDef.angleChecks) {
                const feedback = this.checkAngle(pose, check);
                if (!feedback.isCorrect) {
                    formFeedback.push(feedback);
                    formScore -= 15; // Deduct points for each form issue
                }
            }
        }

        formScore = Math.max(0, formScore);

        // ============================================================
        // VELOCITY & ROBUSTNESS
        // Track hip movement to detect "Setup Fakes" (e.g., bending for phone)
        // ============================================================
        const currentY = (pose.landmarks.leftHip?.y || 0 + (pose.landmarks.rightHip?.y || 0)) / 2;
        const deltaTime = (pose.timestamp - (this.session.startTime + (Date.now() - this.session.startTime) - pose.timestamp)) || 16; // Approx 60fps fallback

        if (this.session.lastY > 0) {
            this.session.velocity = Math.abs(currentY - this.session.lastY) / (deltaTime / 1000);
        }
        this.session.lastY = currentY;

        // ============================================================
        // PHASE DEBOUNCING: Prevent flickering between phases
        // Phase must be stable for DEBOUNCE_FRAMES before we confirm it
        // ============================================================
        const DEBOUNCE_FRAMES = 3;

        // Reset phase flag each frame
        this.session.phaseJustChanged = false;

        if (phase === this.session.currentPhase) {
            // Phase unchanged - increment stability counter
            this.session.phaseStableFrames++;
        } else {
            // Phase changed - reset counter and update current
            this.session.phaseStableFrames = 1;
            this.session.lastPhase = this.session.currentPhase;
            this.session.currentPhase = phase;
        }

        // Only confirm phase after it's been stable for DEBOUNCE_FRAMES
        const previousConfirmed = this.session.confirmedPhase;
        if (this.session.phaseStableFrames >= DEBOUNCE_FRAMES &&
            phase !== this.session.confirmedPhase) {
            this.session.confirmedPhase = phase;
            this.session.phaseJustChanged = true;
            this.session.lastPhaseChangeTime = Date.now();
        }

        // ============================================================
        // FEEDBACK THROTTLING
        // Don't give form corrections until user is in a phase for > 1s
        // This prevents "Stand up straight" cues during movement transitions
        // ============================================================
        const timeInPhase = Date.now() - this.session.lastPhaseChangeTime;
        const throttledFeedback = timeInPhase > 1000 ? formFeedback : [];

        // ============================================================
        // REP COUNTING WITH HYSTERESIS
        // Uses actual angle values with dead zone to prevent jitter
        // ============================================================
        if (this.exercise.type === 'reps') {
            const now = Date.now();

            // Get primary joint angle (first angle check of 'down' phase)
            const downPhase = this.exercise.phases.find(p => p.name === 'down');
            const primaryCheck = downPhase?.angleChecks[0];
            let currentAngle = 180; // Default to standing

            if (primaryCheck) {
                const joint = pose.landmarks[primaryCheck.joint];
                const connected1 = pose.landmarks[primaryCheck.connectedTo[0]];
                const connected2 = pose.landmarks[primaryCheck.connectedTo[1]];

                if (joint && connected1 && connected2) {
                    currentAngle = calculateAngle(connected1, joint, connected2);
                }
            }

            // Track lowest angle during descent
            if (currentAngle < this.session.lowestAngle) {
                this.session.lowestAngle = currentAngle;
            }

            // HYSTERESIS THRESHOLDS (with dead zone between 90-155)
            const ARM_THRESHOLD = 90;   // Must go below this to arm
            const FIRE_THRESHOLD = 155; // Must go above this to fire
            const REP_COOLDOWN_MS = 500; // Minimum time between reps

            // Stage 1: ARM when angle goes below threshold (deep in squat)
            if (currentAngle < ARM_THRESHOLD && !this.session.readyToCountRep) {
                this.session.readyToCountRep = true;
            }

            // Stage 2: FIRE when angle goes above threshold AND armed AND cooldown passed
            const cooldownPassed = (now - this.session.lastRepTime) > REP_COOLDOWN_MS;

            if (this.session.readyToCountRep &&
                currentAngle > FIRE_THRESHOLD &&
                cooldownPassed) {

                this.session.repCount++;
                this.session.readyToCountRep = false; // DISARM
                this.session.lastRepTime = now;       // Start cooldown
                this.session.lowestAngle = 180;       // Reset for next cycle

                const repDuration = Date.now() - this.session.currentRepStartTime;
                this.session.reps.push({
                    repNumber: this.session.repCount,
                    formScore,
                    duration: repDuration,
                    feedback: formFeedback.map((f) => f.message),
                });
                this.session.currentRepStartTime = Date.now();
            }
        }

        // Track form score
        if (formScore > 0) {
            this.session.formScores.push(formScore);
        }

        // Handle hold exercises
        let holdSeconds: number | undefined;
        if (this.exercise.type === 'hold' && phase === 'hold') {
            if (!this.session.holdStartTime) {
                this.session.holdStartTime = Date.now();
            }
            holdSeconds = Math.round((Date.now() - this.session.holdStartTime) / 1000);
        } else if (this.exercise.type === 'hold') {
            this.session.holdStartTime = undefined;
        }

        // Rep was completed this frame if count increased
        const repCompleted = this.session.repCount > repCountBefore;

        return {
            phase: this.session.confirmedPhase, // Return debounced phase
            confidence,
            formFeedback: throttledFeedback,
            formScore,
            repCompleted,
            holdSeconds,
            phaseJustChanged: this.session.phaseJustChanged,
            isArmed: this.session.readyToCountRep,
        };
    }

    /**
     * Get completed reps data
     */
    getCompletedReps(): RepResult[] {
        return [...this.session.reps];
    }

    /**
     * Reset for a new set
     */
    resetForNewSet(): void {
        this.session.repCount = 0;
        this.session.currentPhase = 'start';
        this.session.lastPhase = null;
        this.session.currentRepStartTime = Date.now();
        this.session.holdStartTime = undefined;
        this.session.readyToCountRep = false;
        // Reset phase debouncing
        this.session.phaseStableFrames = 0;
        this.session.confirmedPhase = 'start';
        this.session.phaseJustChanged = false;
        // Reset hysteresis
        this.session.lastRepTime = 0;
        this.session.lowestAngle = 180;
        this.session.lastY = 0;
        this.session.velocity = 0;
        this.session.lastPhaseChangeTime = Date.now();
    }

    /**
     * Get final session summary
     */
    getSessionSummary(): {
        totalReps: number;
        averageFormScore: number;
        totalDurationSeconds: number;
        reps: RepResult[];
        caloriesBurned: number;
    } {
        const avgScore = this.session.formScores.length > 0
            ? Math.round(this.session.formScores.reduce((a, b) => a + b, 0) / this.session.formScores.length)
            : 100;

        const durationSeconds = Math.round((Date.now() - this.session.startTime) / 1000);

        let caloriesBurned = 0;
        if (this.exercise.caloriesPerRep) {
            caloriesBurned = this.session.repCount * this.exercise.caloriesPerRep;
        } else if (this.exercise.caloriesPerMinute) {
            caloriesBurned = (durationSeconds / 60) * this.exercise.caloriesPerMinute;
        }

        return {
            totalReps: this.session.repCount,
            averageFormScore: avgScore,
            totalDurationSeconds: durationSeconds,
            reps: [...this.session.reps],
            caloriesBurned: Math.round(caloriesBurned * 10) / 10,
        };
    }
}

/**
 * Factory function to create analyzer for any exercise
 */
export function createExerciseAnalyzer(exerciseId: string): ExerciseAnalyzer {
    return new ExerciseAnalyzer(exerciseId);
}

/**
 * Quick utility to get form tips for an exercise
 */
export function getFormTips(exerciseId: string): string[] {
    const exercise = getExerciseById(exerciseId);
    return exercise?.tips ?? [];
}

/**
 * Quick utility to get common mistakes for an exercise
 */
export function getCommonMistakes(exerciseId: string): string[] {
    const exercise = getExerciseById(exerciseId);
    return exercise?.commonMistakes ?? [];
}
