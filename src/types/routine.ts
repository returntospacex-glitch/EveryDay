export type Category = string;

export type FrequencyType = 'daily' | 'interval' | 'weekly' | 'none';

export interface Frequency {
    type: FrequencyType;
    value: number; // interval days (2 = every 2 days) or weekly target (3 = 3 times/week)
}

export interface Habit {
    id: string;
    title: string;
    category: Category;
    frequency: Frequency;
    startDate: string; // YYYY-MM-DD
    completedDates: string[]; // Log of all completed dates (YYYY-MM-DD)
    value?: number;
    unit?: string;
}

export interface Routine {
    id: string;
    title: string;
    category: Category;
    isCompleted: boolean;
    value?: number;
    unit?: string;
    date: string; // YYYY-MM-DD
}

export interface SleepRecord {
    id: string;
    date: string; // YYYY-MM-DD
    bedTime: string; // HH:mm
    wakeTime: string; // HH:mm
    duration: number; // hours
    quality: 1 | 2 | 3 | 4 | 5; // 1-5 rating
    memo?: string;
}

export interface ExerciseRecord {
    id: string;
    date: string; // YYYY-MM-DD
    type: string; // e.g. "Running", "Gym"
    duration: number; // minutes
    intensity?: 'Low' | 'Medium' | 'High';
    memo?: string;
}
