# AI Motion Capture Coach - Implementation Guide

## Overview

The Gymless app now includes a **premium AI-powered motion capture system** that provides real-time form analysis, rep counting, and personalized coaching feedback during workouts. This system uses TensorFlow.js pose detection and Gemini 3 Flash AI to create a world-class coaching experience.

## Key Features

### 1. Real-Time Pose Detection
- Uses TensorFlow.js MoveNet model for 33-point skeleton tracking
- Runs entirely in the browser/app (privacy-first)
- 30fps camera input with 15fps processing for optimal performance
- Works on web, Android, and iOS (with appropriate setup)

### 2. Intelligent Rep Counting
- Automatic rep detection based on exercise-specific biomechanics
- Phase tracking (descending, bottom, ascending)
- Range of motion validation
- False rep prevention with minimum duration thresholds

### 3. AI-Powered Form Analysis
- Real-time form scoring (0-100 scale)
- Severity-based violation detection (critical, major, minor)
- Biomechanical rule evaluation:
  - Joint angle measurements
  - Body alignment checks
  - Symmetry verification
  - Movement velocity analysis

### 4. Live Coaching Feedback
- Gemini 3 Flash AI provides contextual coaching cues
- Safety-first priority system
- Fatigue detection and adaptive guidance
- Motivational encouragement
- 2-second inference intervals for responsive feedback

### 5. Progress Tracking
- Per-exercise form analytics
- Rep-by-rep scoring history
- Form improvement trends over time
- Local-first storage (AsyncStorage)

## Supported Exercises (MVP)

The system currently supports 3 exercises with full motion capture:

1. **Squat**
   - Camera: Side view
   - Tracks: Hip depth, knee tracking, spine alignment
   - Rep trigger: Hip vertical position

2. **Push-up**
   - Camera: Side view
   - Tracks: Elbow depth, body alignment, symmetry
   - Rep trigger: Shoulder vertical position

3. **Plank** (Isometric)
   - Camera: Side view
   - Tracks: Body straight-line, hip sag/pike
   - Rep trigger: Time-based hold

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  React Component Layer                   │
│  • MotionCaptureOverlay (UI)                            │
│  • RepCounter, FormMeter, CoachingCueCard               │
│  • useMotionCapture (React Hook)                        │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│              MotionCaptureEngine (Core)                  │
│  • Orchestrates all subsystems                          │
│  • Manages camera lifecycle                             │
│  • Coordinates feedback delivery                        │
└────┬────────┬─────────┬──────────┬─────────────────────┘
     │        │         │          │
     ▼        ▼         ▼          ▼
┌─────────┐ ┌────────┐ ┌────────┐ ┌───────────────┐
│  Pose   │ │  Rep   │ │ Form   │ │    Gemini     │
│Detector │ │Counter │ │Scorer  │ │AI Client      │
│         │ │        │ │        │ │               │
│TensorFlow│ │Generic │ │Rule-   │ │Gemini 3 Flash │
│MoveNet  │ │Logic   │ │Based   │ │thinkingLevel: │
│         │ │        │ │        │ │"minimal"      │
└─────────┘ └────────┘ └────────┘ └───────────────┘
```

## File Structure

```
project/
├── types/
│   └── motion-capture.ts                 # TypeScript interfaces
├── motion-capture/
│   ├── core/
│   │   ├── MotionCaptureEngine.ts       # Main orchestrator
│   │   ├── PoseDetector.ts              # TensorFlow.js wrapper
│   │   ├── RepCounter.ts                # Rep counting logic
│   │   ├── FormScorer.ts                # Form evaluation
│   │   └── GeminiClient.ts              # AI coaching
│   ├── definitions/
│   │   └── exerciseDefinitions.ts       # Exercise configs
│   └── utils/
│       └── biomechanicsUtils.ts         # Angle calculations
├── components/
│   └── motion-capture/
│       ├── MotionCaptureView.tsx        # Camera component
│       ├── MotionCaptureOverlay.tsx     # Full UI overlay
│       ├── RepCounter.tsx               # Rep display
│       ├── FormMeter.tsx                # Form score ring
│       └── CoachingCueCard.tsx          # AI feedback card
├── hooks/
│   └── useMotionCapture.ts              # Main React hook
└── app/
    └── motion-capture-demo.tsx          # Demo page
```

## Setup Instructions

### 1. Install Dependencies

Already included in `package.json`:
```json
{
  "@google/generative-ai": "^0.21.0",
  "@tensorflow-models/pose-detection": "^2.1.3",
  "@tensorflow/tfjs": "^4.22.0",
  "@tensorflow/tfjs-backend-webgl": "^4.22.0"
}
```

### 2. Configure Gemini API Key

Add your Gemini API key to `.env`:

```env
EXPO_PUBLIC_GEMINI_API_KEY=your-actual-api-key-here
```

Get your API key from: https://makersuite.google.com/app/apikey

### 3. Access the Demo

Navigate to `/motion-capture-demo` in the app to test the system.

## Usage Example

```typescript
import { useMotionCapture } from '@/hooks/useMotionCapture';

function MyWorkoutComponent() {
  const {
    isInitialized,
    repCount,
    formScore,
    currentCue,
    startCapture,
    stopCapture,
  } = useMotionCapture({
    exerciseId: 'squat',
    exerciseName: 'Squat',
    enabled: true,
    onRepComplete: (count) => {
      console.log(`Rep ${count} completed!`);
    },
  });

  return (
    <View>
      <MotionCaptureOverlay
        repCount={repCount}
        formScore={formScore}
        coachingCue={currentCue}
        onClose={stopCapture}
      />
    </View>
  );
}
```

## Adding New Exercises

To add a new exercise with motion capture support:

1. **Define the exercise** in `motion-capture/definitions/exerciseDefinitions.ts`:

```typescript
export const NEW_EXERCISE_DEFINITION: ExerciseMotionCapture = {
  supported: true,
  movementPattern: 'squat-pattern',  // or push, pull, plank, etc.
  cameraView: 'side',

  biomechanics: {
    primaryJoints: ['hip', 'knee', 'ankle'],
    // ... configure ranges, alignment, symmetry
  },

  repCounting: {
    triggerJoint: 'hip',
    triggerAxis: 'y',
    startThreshold: 0.65,
    endThreshold: 0.90,
    // ...
  },

  formRules: [
    {
      id: 'depth',
      name: 'Depth',
      severity: 'major',
      // ...
    },
  ],

  coaching: {
    setupCues: ['Stand with feet hip-width', '...'],
    commonMistakes: ['shallow-depth', '...'],
    // ...
  },

  safety: {
    stopConditions: ['excessive-forward-lean'],
    // ...
  },
};
```

2. **Register the exercise** in the `EXERCISE_DEFINITIONS` map:

```typescript
export const EXERCISE_DEFINITIONS: Record<string, ExerciseMotionCapture> = {
  squat: SQUAT_DEFINITION,
  pushup: PUSHUP_DEFINITION,
  plank: PLANK_DEFINITION,
  'new-exercise': NEW_EXERCISE_DEFINITION,  // Add here
};
```

3. **Test** using the motion capture demo page

## Performance Optimization

The system is designed for real-time performance:

- **Frame Processing**: 15fps (every 2nd frame)
- **AI Inference**: Every 2 seconds
- **Camera Resolution**: 640x480 (web), 720p (mobile)
- **Model**: MoveNet Thunder (accurate, ~50ms latency)

### Tips for Better Performance

1. Ensure good lighting
2. Clear, uncluttered background
3. Position full body in frame
4. Use side angle for most exercises
5. Close other heavy applications

## Data Privacy

All motion capture data stays on device:
- No video is uploaded to servers
- Only landmark coordinates sent to Gemini API (not images)
- Analytics stored locally in AsyncStorage
- User can disable motion capture anytime

## Troubleshooting

### Camera Not Working
- Check camera permissions
- Ensure HTTPS (required for WebRTC)
- Try different browser (Chrome/Safari recommended)

### Pose Detection Not Initializing
- Check browser console for TensorFlow errors
- Ensure WebGL is supported
- Try clearing browser cache

### Low Form Scores
- Ensure full body visible
- Check lighting conditions
- Verify exercise form matches definition
- Review common mistakes in definition

### AI Coaching Not Responding
- Verify Gemini API key is set
- Check network connection
- Review browser console for API errors
- Check API quota/rate limits

## Future Enhancements (Phase 2+)

Planned features for future releases:

1. **Exercise Library Expansion**
   - 30+ exercises with full support
   - Multi-angle support
   - Dynamic camera switching

2. **Advanced Analytics**
   - Movement pattern analysis
   - Injury risk indicators
   - Form comparison (current vs best)
   - Weekly/monthly reports

3. **Social Features**
   - Form review sharing
   - Expert coaching integration
   - Challenge leaderboards

4. **Platform Support**
   - iOS native implementation
   - Android native optimization
   - Offline mode with local AI models

## Credits

Built using:
- **TensorFlow.js** - Pose detection
- **MoveNet** - Single-pose estimation model
- **Gemini 3 Flash** - AI coaching feedback
- **Expo** - Cross-platform framework
- **React Native** - UI components

## License

This motion capture system is part of the Gymless app and follows the same license terms.

## Support

For questions or issues:
1. Check this README
2. Review demo page implementation
3. Check browser console for errors
4. Verify all dependencies installed

---

**Built with ❤️ for the Gymless community**
