/**
 * Exercise Image Mapping
 * 
 * Maps exercise IDs to local required assets.
 * Note: React Native 'require' needs static strings.
 */

export const EXERCISE_IMAGES: Record<string, any> = {
    'squats': require('../assets/images/Exercises/Squats.jpg'),
    'wall-sit': require('../assets/images/Exercises/Wall_Sit.jpg'),
    'glute-bridges': require('../assets/images/Exercises/Glute_Bridges.jpg'),
    'lunges': require('../assets/images/Exercises/Lunges.jpg'),
    'calf-raises': require('../assets/images/Exercises/Calf_Raises.jpg'),
    'sumo-squats': require('../assets/images/Exercises/Sumo_Squats.jpg'),
    'crunches': require('../assets/images/Exercises/Crunches.jpg'),
    'leg-raises': require('../assets/images/Exercises/Leg_Raises.jpg'),
    'side-plank': require('../assets/images/Exercises/Side_Plank.jpg'),
    'russian-twists': require('../assets/images/Exercises/Russian_Twists.jpg'),
    'superman': require('../assets/images/Exercises/Superman.jpg'),
    'bird-dogs': require('../assets/images/Exercises/Bird_Dogs.jpg'),
    'push-ups': require('../assets/images/Exercises/Push-Ups.jpg'),
    'knee-push-ups': require('../assets/images/Exercises/Knee_Push-Ups.jpg'),
    'incline-push-ups': require('../assets/images/Exercises/Incline_Push-Ups.jpg'),
    'chair-dips': require('../assets/images/Exercises/Chair_Dips.jpg'),
    'pike-push-ups': require('../assets/images/Exercises/Pike_Push-Ups.jpg'),
    'arm-circles': require('../assets/images/Exercises/Arm_Circles.jpg'),
    'wall-angels': require('../assets/images/Exercises/Wall_Angels.jpg'),
    'single-leg-stand': require('../assets/images/Exercises/Single-Leg_Stand.jpg'),
    'forward-fold': require('../assets/images/Exercises/Forward_Fold.jpg'),
};

export const BODY_PART_IMAGES: Record<string, any> = {
    'abs': require('../assets/images/Body-parts/Abs.jpg'),
    'balance': require('../assets/images/Body-parts/Balance.jpg'),
    'biceps': require('../assets/images/Body-parts/Bicep.jpg'), // Note: File is Bicep.jpg
    'calves': require('../assets/images/Body-parts/Calves.jpg'),
    'chest': require('../assets/images/Body-parts/Chest.jpg'),
    'hamstrings': require('../assets/images/Body-parts/Hamstring.jpg'), // Note: File is Hamstring.jpg
    'legs': require('../assets/images/Body-parts/Legs.jpg'),
    'lower-back': require('../assets/images/Body-parts/Lower_Back.jpg'),
    'obliques': require('../assets/images/Body-parts/Obliques.jpg'),
    'shoulders': require('../assets/images/Body-parts/Shoulders.jpg'),
    'thighs': require('../assets/images/Body-parts/Thighs.jpg'),
    'triceps': require('../assets/images/Body-parts/Triceps.jpg'),
    'upper-back': require('../assets/images/Body-parts/Upper_Back..jpg'), // Note: Double dot in filename
    'flexibility': require('../assets/images/Body-parts/flexibility.jpg'),
    'glutes': require('../assets/images/Body-parts/glutes.jpg'),
    'full-body': require('../assets/images/Body-parts/Legs.jpg'), // Fallback/Generic
    'cardio': require('../assets/images/Body-parts/Legs.jpg'), // Fallback
};

export const FEATURE_IMAGES: Record<string, any> = {
    'ai_coach': require('../assets/images/Features/ai_coach_mode.jpg'),
    'timer': require('../assets/images/Features/timer_mode.jpg'),
};

export const BANNER_IMAGES: Record<string, any> = {
    'challenge_30': require('../assets/images/Banners/banner_challenge_30.jpg'),
};
