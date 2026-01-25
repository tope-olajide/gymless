import { MuscleGroup, BodyPart, BodyRegion } from '@/types/exercise';

export const muscleGroups: Record<string, MuscleGroup> = {
  legs: {
    id: 'legs',
    name: 'Legs',
    bodyRegion: 'lower-body',
    description: 'Build overall leg strength and endurance with these compound movements.',
    benefits: ['Strength', 'Endurance', 'Balance'],
    exercises: ['squats', 'wallSit', 'stepUps', 'chairSquats'],
    icon: 'footprints',
    color: '#10B981',
    gradientColors: ['#10B981', '#059669'],
  },
  thighs: {
    id: 'thighs',
    name: 'Thighs',
    bodyRegion: 'lower-body',
    description: 'Target your front and inner thighs for definition and knee stability.',
    benefits: ['Thigh definition', 'Knee stability'],
    exercises: ['squats', 'staticLunges', 'sumoSquats'],
    icon: 'zap',
    color: '#059669',
    gradientColors: ['#059669', '#047857'],
  },
  hamstrings: {
    id: 'hamstrings',
    name: 'Hamstrings',
    bodyRegion: 'lower-body',
    description: 'Strengthen the back of your thighs for better lower-body control.',
    benefits: ['Posterior leg strength', 'Lower-body control'],
    exercises: ['gluteBridges', 'singleLegGluteBridges', 'hipHinges'],
    icon: 'move-vertical',
    color: '#047857',
    gradientColors: ['#047857', '#065F46'],
  },
  glutes: {
    id: 'glutes',
    name: 'Glutes',
    bodyRegion: 'lower-body',
    description: 'Power up your hips for better posture and lower-back support.',
    benefits: ['Hip power', 'Posture', 'Lower-back support'],
    exercises: ['gluteBridges', 'chairSquats', 'reverseLunges', 'singleLegGluteBridges'],
    icon: 'circle-dot',
    color: '#065F46',
    gradientColors: ['#065F46', '#064E3B'],
  },
  calves: {
    id: 'calves',
    name: 'Calves',
    bodyRegion: 'lower-body',
    description: 'Build ankle strength for better jumping and walking endurance.',
    benefits: ['Ankle strength', 'Jumping and walking endurance'],
    exercises: ['calfRaises', 'singleLegCalfRaises'],
    icon: 'arrow-down',
    color: '#064E3B',
    gradientColors: ['#064E3B', '#022C22'],
  },
  abs: {
    id: 'abs',
    name: 'Abs',
    bodyRegion: 'core',
    description: 'Strengthen your front core for better trunk control.',
    benefits: ['Core strength', 'Trunk control'],
    exercises: ['crunches', 'legRaises', 'seatedKneeTucks', 'plank', 'mountainClimbers'],
    icon: 'square',
    color: '#F59E0B',
    gradientColors: ['#F59E0B', '#D97706'],
  },
  obliques: {
    id: 'obliques',
    name: 'Obliques',
    bodyRegion: 'core',
    description: 'Build waist stability and rotational strength.',
    benefits: ['Waist stability', 'Rotational strength'],
    exercises: ['sidePlanks', 'standingSideBends', 'russianTwists'],
    icon: 'git-branch',
    color: '#D97706',
    gradientColors: ['#D97706', '#B45309'],
  },
  lowerBack: {
    id: 'lowerBack',
    name: 'Lower Back',
    bodyRegion: 'core',
    description: 'Support your spine and prevent injuries with these exercises.',
    benefits: ['Spine support', 'Injury prevention'],
    exercises: ['supermanHolds', 'birdDogs', 'gluteBridges'],
    icon: 'shield',
    color: '#B45309',
    gradientColors: ['#B45309', '#92400E'],
  },
  chest: {
    id: 'chest',
    name: 'Chest',
    bodyRegion: 'upper-body',
    description: 'Build upper-body pushing strength with push-up variations.',
    benefits: ['Upper-body pushing strength'],
    exercises: ['pushUps', 'kneePushUps', 'inclinePushUps'],
    icon: 'heart',
    color: '#3B82F6',
    gradientColors: ['#3B82F6', '#2563EB'],
  },
  triceps: {
    id: 'triceps',
    name: 'Triceps',
    bodyRegion: 'upper-body',
    description: 'Strengthen the back of your arms for push endurance.',
    benefits: ['Arm strength', 'Push endurance'],
    exercises: ['chairDips', 'closeGripPushUps'],
    icon: 'chevrons-right',
    color: '#2563EB',
    gradientColors: ['#2563EB', '#1D4ED8'],
  },
  biceps: {
    id: 'biceps',
    name: 'Biceps',
    bodyRegion: 'upper-body',
    description: 'Build arm tension and control with isometric exercises.',
    benefits: ['Arm tension and control'],
    exercises: ['isometricTowelCurls'],
    icon: 'chevrons-up',
    color: '#1D4ED8',
    gradientColors: ['#1D4ED8', '#1E40AF'],
  },
  shoulders: {
    id: 'shoulders',
    name: 'Shoulders',
    bodyRegion: 'upper-body',
    description: 'Build shoulder stability and upper-body balance.',
    benefits: ['Shoulder stability', 'Upper-body balance'],
    exercises: ['armCircles', 'pikePushUps', 'wallHandHold'],
    icon: 'move-horizontal',
    color: '#1E40AF',
    gradientColors: ['#1E40AF', '#1E3A8A'],
  },
  upperBack: {
    id: 'upperBack',
    name: 'Upper Back',
    bodyRegion: 'upper-body',
    description: 'Improve posture and shoulder health.',
    benefits: ['Posture', 'Shoulder health'],
    exercises: ['wallAngels', 'reverseSnowAngels', 'supermanPulls'],
    icon: 'align-center',
    color: '#1E3A8A',
    gradientColors: ['#1E3A8A', '#172554'],
  },
  balance: {
    id: 'balance',
    name: 'Balance',
    bodyRegion: 'balance-mobility',
    description: 'Improve stability and proprioception.',
    benefits: ['Balance', 'Proprioception', 'Fall prevention'],
    exercises: ['singleLegStands', 'heelToToeWalk', 'singleLegSquatsAssisted'],
    icon: 'scale',
    color: '#8B5CF6',
    gradientColors: ['#8B5CF6', '#7C3AED'],
  },
  flexibility: {
    id: 'flexibility',
    name: 'Flexibility',
    bodyRegion: 'balance-mobility',
    description: 'Increase range of motion and reduce muscle tension.',
    benefits: ['Flexibility', 'Relaxation', 'Injury prevention'],
    exercises: ['forwardFolds', 'hipFlexorStretches', 'shoulderStretches'],
    icon: 'wind',
    color: '#7C3AED',
    gradientColors: ['#7C3AED', '#6D28D9'],
  },
};

export const bodyParts: Record<BodyRegion, BodyPart> = {
  'lower-body': {
    id: 'lower-body',
    name: 'Lower Body',
    description: 'Legs, thighs, glutes, and calves',
    muscleGroups: ['legs', 'thighs', 'hamstrings', 'glutes', 'calves'],
    icon: 'footprints',
    color: '#10B981',
  },
  'core': {
    id: 'core',
    name: 'Core',
    description: 'Abs, obliques, and lower back',
    muscleGroups: ['abs', 'obliques', 'lowerBack'],
    icon: 'target',
    color: '#F59E0B',
  },
  'upper-body': {
    id: 'upper-body',
    name: 'Upper Body',
    description: 'Chest, arms, shoulders, and back',
    muscleGroups: ['chest', 'triceps', 'biceps', 'shoulders', 'upperBack'],
    icon: 'dumbbell',
    color: '#3B82F6',
  },
  'balance-mobility': {
    id: 'balance-mobility',
    name: 'Balance & Mobility',
    description: 'Balance exercises and stretches',
    muscleGroups: ['balance', 'flexibility'],
    icon: 'activity',
    color: '#8B5CF6',
  },
};

export const getBodyPartById = (id: BodyRegion): BodyPart | undefined => {
  return bodyParts[id];
};

export const getMuscleGroupById = (id: string): MuscleGroup | undefined => {
  return muscleGroups[id];
};

export const getMuscleGroupsByBodyPart = (bodyPartId: BodyRegion): MuscleGroup[] => {
  const bodyPart = bodyParts[bodyPartId];
  if (!bodyPart) return [];
  return bodyPart.muscleGroups.map(id => muscleGroups[id]).filter(Boolean);
};

export const getAllBodyParts = (): BodyPart[] => {
  return Object.values(bodyParts);
};

export const getAllMuscleGroups = (): MuscleGroup[] => {
  return Object.values(muscleGroups);
};
