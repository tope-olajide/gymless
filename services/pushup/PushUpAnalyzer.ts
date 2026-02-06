/**
 * Push-Up Analyzer
 * Analyzes pose data to count reps and validate form
 */

import { PushUpPose, PushUpFormAnalysis, PushUpPhase, FormIssue } from '@/types';
import {
    calculateElbowAngles,
    calculateBodyAlignment,
    getShoulderDepth,
    checkShoulderAlignment,
    isPoseValid,
} from '@/utils/pushUpBiomechanics';

export class PushUpAnalyzer {
    private phase: PushUpPhase = 'up';
    private repCount: number = 0;
    private topShoulderY: number | null = null;
    private bottomShoulderY: number | null = null;
    private inRepMotion: boolean = false;

    /**
     * Analyze a single pose frame
     */
    analyzePose(pose: PushUpPose): PushUpFormAnalysis {
        // Check if pose is valid (all keypoints detected)
        if (!isPoseValid(pose, 0.5)) {
            return this.getInvalidPoseAnalysis();
        }

        const shoulderY = getShoulderDepth(pose);
        const elbowAngles = calculateElbowAngles(pose);
        const bodyAlignment = calculateBodyAlignment(pose);
        const shoulderAlign = checkShoulderAlignment(pose);

        // Detect phase (up/down/transition)
        const newPhase = this.detectPhase(shoulderY, elbowAngles);

        // Calculate form score
        const formScore = this.calculateFormScore({
            elbowAngles,
            bodyAlignment,
            shoulderAlignment: shoulderAlign.difference,
        });

        // Detect issues
        const issues = this.detectFormIssues({
            elbowAngles,
            bodyAlignment,
            shoulderAlign,
        });

        // Check if this should count as a valid rep
        const isValidRep = formScore >= 70; // Minimum 70% form to count

        return {
            score: formScore,
            phase: newPhase,
            leftElbowAngle: elbowAngles.left,
            rightElbowAngle: elbowAngles.right,
            bodyAlignment,
            shoulderDepth: shoulderY,
            issues,
            isValidRep,
        };
    }

    /**
     * Detect current phase of push-up
     */
    private detectPhase(shoulderY: number, elbowAngles: { left: number; right: number }): PushUpPhase {
        // Initialize baseline if needed
        if (this.topShoulderY === null) {
            this.topShoulderY = shoulderY;
            return 'up';
        }

        const avgElbowAngle = (elbowAngles.left + elbowAngles.right) / 2;

        // Down phase: elbows bent significantly
        if (avgElbowAngle < 100) {
            if (this.bottomShoulderY === null || shoulderY > this.bottomShoulderY) {
                this.bottomShoulderY = shoulderY;
            }

            if (this.phase === 'up') {
                this.inRepMotion = true;
            }

            return 'down';
        }

        // Up phase: elbows mostly straight
        if (avgElbowAngle > 150) {
            // Check if we completed a rep
            if (this.inRepMotion && this.phase === 'down') {
                this.repCount++;
                this.inRepMotion = false;
            }

            return 'up';
        }

        // Transition
        return 'transition';
    }

    /**
     * Calculate overall form score (0-100)
     */
    private calculateFormScore(metrics: {
        elbowAngles: { left: number; right: number };
        bodyAlignment: number;
        shoulderAlignment: number;
    }): number {
        let score = 100;

        // Elbow symmetry (max -20 points)
        const elbowDiff = Math.abs(metrics.elbowAngles.left - metrics.elbowAngles.right);
        score -= Math.min(20, elbowDiff / 2);

        // Body alignment (max -30 points)
        score -= Math.min(30, metrics.bodyAlignment * 10);

        // Shoulder alignment (max -20 points)
        score -= Math.min(20, metrics.shoulderAlignment * 100);

        // Elbow flare check (max -30 points)
        const avgElbow = (metrics.elbowAngles.left + metrics.elbowAngles.right) / 2;
        if (avgElbow > 100) {
            // Elbows should be tucked during descent
            const flarePenalty = (avgElbow - 100) / 2;
            score -= Math.min(30, flarePenalty);
        }

        return Math.max(0, Math.round(score));
    }

    /**
     * Detect specific form issues
     */
    private detectFormIssues(metrics: {
        elbowAngles: { left: number; right: number };
        bodyAlignment: number;
        shoulderAlign: { isAligned: boolean; difference: number };
    }): FormIssue[] {
        const issues: FormIssue[] = [];

        // Elbow flare
        const avgElbow = (metrics.elbowAngles.left + metrics.elbowAngles.right) / 2;
        if (avgElbow > 110 && this.phase === 'down') {
            issues.push({
                type: 'elbow_flare',
                severity: 'high',
                message: 'Elbows flaring out—tuck them closer to body',
            });
        }

        // Hip sag
        if (metrics.bodyAlignment > 0.1) {
            issues.push({
                type: 'hip_sag',
                severity: 'medium',
                message: 'Hips sagging—engage your core',
            });
        }

        // Uneven shoulders
        if (!metrics.shoulderAlign.isAligned) {
            issues.push({
                type: 'uneven_shoulders',
                severity: 'medium',
                message: 'Shoulders uneven—check hand placement',
            });
        }

        return issues;
    }

    /**
     * Return invalid pose analysis
     */
    private getInvalidPoseAnalysis(): PushUpFormAnalysis {
        return {
            score: 0,
            phase: this.phase,
            leftElbowAngle: 0,
            rightElbowAngle: 0,
            bodyAlignment: 0,
            shoulderDepth: 0,
            issues: [],
            isValidRep: false,
        };
    }

    /**
     * Get current rep count
     */
    getRepCount(): number {
        return this.repCount;
    }

    /**
     * Reset analyzer state
     */
    reset(): void {
        this.phase = 'up';
        this.repCount = 0;
        this.topShoulderY = null;
        this.bottomShoulderY = null;
        this.inRepMotion = false;
    }
}
