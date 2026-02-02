import { GoogleGenerativeAI } from '@google/generative-ai';
import { FormMetrics, RepState, CoachingCue } from '@/types/motion-capture';

const BIOMECHANICS_SYSTEM_PROMPT = `You are "Gymless Biomechanics Lead" — an expert biomechanics analyst and real-time fitness coach.

Your function is to interpret live 3D human pose landmark data and produce immediate, high-confidence exercise form feedback.

You operate under real-time constraints and must prioritize safety, clarity, and brevity.

INPUT:
Every inference cycle (≈2 seconds), you receive a JSON object with:
{
  "exercise_type": string,
  "rep_velocity": number,
  "consistency_score": number,
  "form_violations": [...],
  "fatigue_detected": boolean,
  "rep_count": number,
  "rep_phase": string
}

DECISION RULES (in priority order):

1. SAFETY INTERRUPTION (Highest Priority)
If form_violations contains critical severity:
→ Output immediate STOP command with one specific corrective cue.
Example: "STOP. Neutral spine. Chest up."

2. FORM vs PERFORMANCE CONTEXT
If form is acceptable AND fatigue_detected:
→ Enter MOTIVATIONAL MODE.
Example: "Strong. 3 more. Hold your form."

If form is degrading AND fatigue_detected:
→ Enter MODIFICATION MODE.
Example: "Take a pause. Reset form."

3. STANDARD COACHING
If no safety issue:
→ Provide a single high-impact coaching cue.
Example: "Good depth. Push knees out."

OUTPUT CONSTRAINTS:
- Maximum 15 words per response
- No filler, no explanations
- No medical or injury diagnosis
- Use technical, coach-style language only
- Responses must be actionable immediately

TECHNICAL REQUIREMENTS:
- Use 3D landmark relationships, including Z-axis depth
- Detect forward/backward torso lean
- Detect asymmetrical loading
- Detect depth inconsistencies across reps
- Assume 2D-only assumptions are insufficient`;

export class GeminiClient {
  private model: any;
  private isInitialized: boolean = false;
  private lastInferenceTime: number = 0;
  private inferenceInterval: number = 2000;

  constructor(apiKey: string) {
    if (!apiKey || apiKey === 'your-api-key-here') {
      console.warn('Gemini API key not configured. Using fallback coaching.');
      return;
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      this.model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-thinking-exp-01-21',
        generationConfig: {
          maxOutputTokens: 50,
          temperature: 0.7,
        },
        systemInstruction: BIOMECHANICS_SYSTEM_PROMPT,
      });
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Gemini client:', error);
    }
  }

  async getCoachingFeedback(
    exerciseType: string,
    metrics: FormMetrics,
    repState: RepState
  ): Promise<CoachingCue | null> {
    const now = Date.now();

    if (now - this.lastInferenceTime < this.inferenceInterval) {
      return null;
    }

    this.lastInferenceTime = now;

    if (!this.isInitialized) {
      return this.getFallbackCoaching(metrics, repState);
    }

    try {
      const payload = {
        exercise_type: exerciseType,
        rep_velocity: metrics.velocity,
        consistency_score: metrics.consistency,
        form_violations: metrics.violations.map((v) => ({
          severity: v.severity,
          message: v.message,
        })),
        fatigue_detected: metrics.fatigueScore > 0.7,
        rep_count: repState.count,
        rep_phase: repState.phase,
      };

      const result = await this.model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [{ text: JSON.stringify(payload) }],
          },
        ],
      });

      const response = await result.response;
      const text = response.text();

      return this.parseCoachingResponse(text, metrics);
    } catch (error) {
      console.error('Gemini API error:', error);
      return this.getFallbackCoaching(metrics, repState);
    }
  }

  private parseCoachingResponse(text: string, metrics: FormMetrics): CoachingCue {
    const isCritical = text.toUpperCase().includes('STOP');
    const hasCriticalViolation = metrics.violations.some((v) => v.severity === 'critical');

    return {
      message: text.trim(),
      type: isCritical ? 'safety' : metrics.violations.length > 0 ? 'form' : 'motivation',
      urgency: hasCriticalViolation ? 'critical' : metrics.score < 70 ? 'high' : 'normal',
      duration: isCritical ? 5000 : 3000,
      timestamp: Date.now(),
    };
  }

  private getFallbackCoaching(metrics: FormMetrics, repState: RepState): CoachingCue {
    const criticalViolations = metrics.violations.filter((v) => v.severity === 'critical');

    if (criticalViolations.length > 0) {
      return {
        message: `STOP. ${criticalViolations[0].correction}`,
        type: 'safety',
        urgency: 'critical',
        duration: 5000,
        timestamp: Date.now(),
      };
    }

    if (metrics.score < 70 && metrics.violations.length > 0) {
      return {
        message: metrics.violations[0].correction,
        type: 'form',
        urgency: 'high',
        duration: 3000,
        timestamp: Date.now(),
      };
    }

    if (metrics.fatigueScore > 0.7) {
      return {
        message: `Form slipping. ${repState.count} reps done.`,
        type: 'motivation',
        urgency: 'normal',
        duration: 3000,
        timestamp: Date.now(),
      };
    }

    if (repState.count > 0 && repState.count % 5 === 0) {
      return {
        message: `${repState.count} reps. Keep it clean.`,
        type: 'motivation',
        urgency: 'normal',
        duration: 2000,
        timestamp: Date.now(),
      };
    }

    return {
      message: 'Good form. Keep going.',
      type: 'motivation',
      urgency: 'normal',
      duration: 2000,
      timestamp: Date.now(),
    };
  }

  setInferenceInterval(ms: number): void {
    this.inferenceInterval = ms;
  }
}
