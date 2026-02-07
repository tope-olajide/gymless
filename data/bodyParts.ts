/**
 * Body Part Categories for Gymless
 * 
 * Organized into 4 main groups:
 * - Lower Body (5 parts)
 * - Core (3 parts)
 * - Upper Body (5 parts)
 * - Bonus (2 categories)
 */

export type BodyPartGroup = 'lower' | 'core' | 'upper' | 'bonus';

export interface BodyPart {
    id: string;
    name: string;
    group: BodyPartGroup;
    icon: string;
    description: string;
    benefits: string[];
    color: string; // For calendar/progress tracking
}

export const BODY_PART_GROUPS: Record<BodyPartGroup, { name: string; icon: string }> = {
    lower: { name: 'Lower Body', icon: '🦵' },
    core: { name: 'Core', icon: '🧍' },
    upper: { name: 'Upper Body', icon: '💪' },
    bonus: { name: 'Balance & Mobility', icon: '🧘' },
};

export const BODY_PARTS: BodyPart[] = [
    // Lower Body
    {
        id: 'legs',
        name: 'Legs',
        group: 'lower',
        icon: '🦵',
        description: 'Overall leg strength and endurance',
        benefits: ['Strength', 'Endurance', 'Balance'],
        color: '#3B82F6', // Blue
    },
    {
        id: 'thighs',
        name: 'Thighs',
        group: 'lower',
        icon: '🏃',
        description: 'Front and inner thigh definition',
        benefits: ['Thigh definition', 'Knee stability'],
        color: '#6366F1', // Indigo
    },
    {
        id: 'hamstrings',
        name: 'Hamstrings',
        group: 'lower',
        icon: '🔥',
        description: 'Back of thigh strength',
        benefits: ['Posterior leg strength', 'Lower-body control'],
        color: '#8B5CF6', // Violet
    },
    {
        id: 'glutes',
        name: 'Glutes',
        group: 'lower',
        icon: '🍑',
        description: 'Hip power and posture support',
        benefits: ['Hip power', 'Posture', 'Lower-back support'],
        color: '#EC4899', // Pink
    },
    {
        id: 'calves',
        name: 'Calves',
        group: 'lower',
        icon: '🦶',
        description: 'Lower leg strength and stability',
        benefits: ['Ankle strength', 'Jumping endurance', 'Walking endurance'],
        color: '#14B8A6', // Teal
    },

    // Core
    {
        id: 'abs',
        name: 'Abs',
        group: 'core',
        icon: '🎯',
        description: 'Front core strength',
        benefits: ['Core strength', 'Trunk control'],
        color: '#F97316', // Orange
    },
    {
        id: 'obliques',
        name: 'Obliques',
        group: 'core',
        icon: '↔️',
        description: 'Side core and rotational power',
        benefits: ['Waist stability', 'Rotational strength'],
        color: '#EAB308', // Yellow
    },
    {
        id: 'lower-back',
        name: 'Lower Back',
        group: 'core',
        icon: '🔙',
        description: 'Spine support and injury prevention',
        benefits: ['Spine support', 'Injury prevention'],
        color: '#F59E0B', // Amber
    },

    // Upper Body
    {
        id: 'chest',
        name: 'Chest',
        group: 'upper',
        icon: '💪',
        description: 'Upper body pushing strength',
        benefits: ['Pushing strength', 'Upper body power'],
        color: '#22C55E', // Green
    },
    {
        id: 'triceps',
        name: 'Triceps',
        group: 'upper',
        icon: '💫',
        description: 'Back of arms strength',
        benefits: ['Arm strength', 'Push endurance'],
        color: '#10B981', // Emerald
    },
    {
        id: 'biceps',
        name: 'Biceps',
        group: 'upper',
        icon: '✊',
        description: 'Front of arms tension',
        benefits: ['Arm tension', 'Arm control'],
        color: '#059669', // Emerald darker
    },
    {
        id: 'shoulders',
        name: 'Shoulders',
        group: 'upper',
        icon: '🔺',
        description: 'Shoulder stability and upper body balance',
        benefits: ['Shoulder stability', 'Upper-body balance'],
        color: '#0EA5E9', // Sky
    },
    {
        id: 'upper-back',
        name: 'Upper Back',
        group: 'upper',
        icon: '🏋️',
        description: 'Posture and shoulder health',
        benefits: ['Posture', 'Shoulder health'],
        color: '#06B6D4', // Cyan
    },

    // Bonus - Balance & Mobility
    {
        id: 'balance',
        name: 'Balance',
        group: 'bonus',
        icon: '⚖️',
        description: 'Stability and body control',
        benefits: ['Stability', 'Coordination', 'Fall prevention'],
        color: '#A855F7', // Purple
    },
    {
        id: 'flexibility',
        name: 'Flexibility',
        group: 'bonus',
        icon: '🧘',
        description: 'Range of motion and recovery',
        benefits: ['Mobility', 'Recovery', 'Injury prevention'],
        color: '#D946EF', // Fuchsia
    },
];

// Helper functions
export function getBodyPartById(id: string): BodyPart | undefined {
    return BODY_PARTS.find((bp) => bp.id === id);
}

export function getBodyPartsByGroup(group: BodyPartGroup): BodyPart[] {
    return BODY_PARTS.filter((bp) => bp.group === group);
}

export function getAllGroups(): BodyPartGroup[] {
    return ['lower', 'core', 'upper', 'bonus'];
}
