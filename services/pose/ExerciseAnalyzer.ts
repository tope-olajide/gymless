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
    analyze(pose: PoseData): PhaseResult & { repCompleted: boolean; holdSeconds?: number } {
        // Check if we have required landmarks
        if (!hasRequiredLandmarks(pose, this.exercise.requiredLandmarks as string[])) {
            return {
                phase: this.session.currentPhase,
                confidence: 0,
                formFeedback: [{
                    isCorrect: false,
                    message: 'Position yourself so your full body is visible',
                    severity: 'warning',
                }],
                formScore: 0,
                repCompleted: false,
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

        // Detect rep completion
        let repCompleted = false;
        const wasUp = this.session.lastPhase === 'up';
        const wasDown = this.session.lastPhase === 'down';
        const isUp = phase === 'up';
        const isDown = phase === 'down';

        // Rep counting logic for different exercise types
        if (this.exercise.type === 'reps') {
            // For rep exercises: down -> up = 1 rep
            if (wasDown && isUp) {
                repCompleted = true;
                this.session.repCount++;

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

        // Update phase tracking
        if (phase !== this.session.currentPhase) {
            this.session.lastPhase = this.session.currentPhase;
            this.session.currentPhase = phase;
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

        return {
            phase,
            confidence,
            formFeedback,
            formScore,
            repCompleted,
            holdSeconds,
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
