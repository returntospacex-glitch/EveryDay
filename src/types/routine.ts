export type Category = '공부' | '운동' | '루틴' | '수면' | '기타';

export interface Routine {
    id: string;
    title: string;
    category: Category;
    isCompleted: boolean;
    value?: number; // 수면 시간(시간)이나 운동량(분) 등 수치 데이터
    unit?: string;  // '시간', '분', 'km' 등
    date: string;   // YYYY-MM-DD
}
