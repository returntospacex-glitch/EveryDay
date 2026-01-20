import { useState, useEffect } from 'react';
import { Category, Routine, FrequencyType } from '@/types/routine';
import { X, Plus, Tag, Calendar, Repeat, Trash2, Check } from 'lucide-react';

interface RoutineData {
    title: string;
    category: Category;
    value?: number;
    unit?: string;
    date: string;
    frequency?: { type: FrequencyType; value: number };
}

interface AddRoutineModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (data: RoutineData) => void;
    onUpdate?: (id: string, data: RoutineData) => void;
    onDelete?: (id: string) => void;
    existingCategories?: Category[];
    initialData?: { id: string } & RoutineData; // For editing
    selectedDate?: string;
}

export default function AddRoutineModal({ isOpen, onClose, onAdd, onUpdate, onDelete, existingCategories = [], initialData, selectedDate }: AddRoutineModalProps) {
    const isEditing = !!initialData;

    const [title, setTitle] = useState('');
    const [category, setCategory] = useState<Category>('루틴');
    const [customCategory, setCustomCategory] = useState('');
    const [isCustom, setIsCustom] = useState(false);
    const [value, setValue] = useState('');
    const [unit, setUnit] = useState('');

    // Frequency State
    const [freqType, setFreqType] = useState<FrequencyType>('none');
    const [freqValue, setFreqValue] = useState('1');

    // Default categories
    const defaults = ['루틴', '운동', '공부', '수면', '기타'];
    const displayCategories = Array.from(new Set([...defaults, ...existingCategories]));

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                // Pre-fill for editing
                setTitle(initialData.title);
                if (displayCategories.includes(initialData.category)) {
                    setCategory(initialData.category);
                    setIsCustom(false);
                } else {
                    setCategory('');
                    setCustomCategory(initialData.category);
                    setIsCustom(true);
                }
                setValue(initialData.value ? String(initialData.value) : '');
                setUnit(initialData.unit || '');
                if (initialData.frequency) {
                    setFreqType(initialData.frequency.type);
                    setFreqValue(String(initialData.frequency.value));
                } else {
                    setFreqType('none');
                    setFreqValue('1');
                }
            } else {
                // Reset for new creation
                setTitle('');
                setCategory('루틴');
                setCustomCategory('');
                setIsCustom(false);
                setValue('');
                setUnit('');
                setFreqType('none');
                setFreqValue('1');
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        const finalCategory = isCustom ? customCategory : category;
        if (!finalCategory) return;

        const getLocalDateString = () => {
            const d = new Date();
            const offset = d.getTimezoneOffset() * 60000;
            return (new Date(d.getTime() - offset)).toISOString().split('T')[0];
        };

        const formData: RoutineData = {
            title,
            category: finalCategory,
            value: value ? Number(value) : undefined,
            unit: unit || undefined,
            date: initialData ? initialData.date : (selectedDate || getLocalDateString()),
            frequency: freqType === 'none' ? undefined : (freqType === 'daily' ? { type: 'daily', value: 1 } : { type: freqType, value: Number(freqValue) || 1 })
        };

        if (isEditing && onUpdate && initialData) {
            onUpdate(initialData.id, formData);
        } else {
            onAdd(formData);
        }
        setTitle('');
        setCategory('루틴');
        setCustomCategory('');
        setIsCustom(false);
        setValue('');
        setUnit('');
        setFreqType('none');
        setFreqValue('1');
        onClose();
    };

    const handleDelete = () => {
        if (isEditing && onDelete && initialData) {
            if (confirm('정말 삭제하시겠습니까?')) {
                onDelete(initialData.id);
                onClose();
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm bg-[#18181b] border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 text-white">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

                <div className="flex justify-between items-center mb-6 relative z-10">
                    <h2 className="text-xl font-bold">{isEditing ? '할 일 수정' : '새로운 할 일'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full hover:bg-white/10">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">이름</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="예: 독서하기"
                            className="w-full bg-[#09090b] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors placeholder-gray-600 focus:ring-1 focus:ring-blue-500/50"
                            autoFocus={!isEditing}
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1.5">
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide">카테고리</label>
                            <button
                                type="button"
                                onClick={() => setIsCustom(!isCustom)}
                                className="text-xs text-blue-400 hover:text-blue-300 flex items-center"
                            >
                                <Plus size={12} className="mr-1" /> {isCustom ? '기존 선택' : '직접 입력'}
                            </button>
                        </div>

                        {isCustom ? (
                            <div className="relative">
                                <Tag className="absolute left-3 top-3.5 text-gray-500" size={16} />
                                <input
                                    type="text"
                                    value={customCategory}
                                    onChange={(e) => setCustomCategory(e.target.value)}
                                    placeholder="새 카테고리 이름"
                                    className="w-full bg-[#09090b] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors placeholder-gray-600 focus:ring-1 focus:ring-blue-500/50"
                                />
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {displayCategories.map((cat) => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setCategory(cat)}
                                        className={`px-3 py-1.5 rounded-lg text-sm transition-all border ${category === cat
                                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/40'
                                            : 'bg-[#09090b] border-white/5 text-gray-400 hover:bg-white/5 hover:text-gray-200'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Frequency Selection */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">반복 설정</label>
                        <div className="grid grid-cols-4 gap-2 mb-2">
                            <button
                                type="button"
                                onClick={() => setFreqType('none')}
                                className={`py-2 rounded-lg text-sm border ${freqType === 'none' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-[#09090b] border-white/10 text-gray-400'}`}
                            >
                                안함
                            </button>
                            <button
                                type="button"
                                onClick={() => setFreqType('daily')}
                                className={`py-2 rounded-lg text-sm border ${freqType === 'daily' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-[#09090b] border-white/10 text-gray-400'}`}
                            >
                                매일
                            </button>
                            <button
                                type="button"
                                onClick={() => setFreqType('interval')}
                                className={`py-2 rounded-lg text-sm border ${freqType === 'interval' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-[#09090b] border-white/10 text-gray-400'}`}
                            >
                                간격
                            </button>
                            <button
                                type="button"
                                onClick={() => setFreqType('weekly')}
                                className={`py-2 rounded-lg text-sm border ${freqType === 'weekly' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-[#09090b] border-white/10 text-gray-400'}`}
                            >
                                주간
                            </button>
                        </div>

                        {freqType === 'interval' && (
                            <div className="flex items-center space-x-2 bg-[#09090b] p-3 rounded-xl border border-white/10">
                                <span className="text-sm text-gray-400">며칠마다 반복할까요?</span>
                                <input
                                    type="number"
                                    min="2"
                                    value={freqValue}
                                    onChange={(e) => setFreqValue(e.target.value)}
                                    className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-center text-white focus:outline-none focus:border-blue-500 appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                />
                                <span className="text-sm text-gray-400">일</span>
                            </div>
                        )}

                        {freqType === 'weekly' && (
                            <div className="flex items-center space-x-2 bg-[#09090b] p-3 rounded-xl border border-white/10">
                                <span className="text-sm text-gray-400">일주일에 몇 번?</span>
                                <input
                                    type="number"
                                    min="1"
                                    max="7"
                                    value={freqValue}
                                    onChange={(e) => setFreqValue(e.target.value)}
                                    className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-center text-white focus:outline-none focus:border-blue-500 appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                />
                                <span className="text-sm text-gray-400">회</span>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">목표 수치 (선택)</label>
                            <input
                                type="number"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                placeholder="0"
                                className="w-full bg-[#09090b] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors placeholder-gray-600 focus:ring-1 focus:ring-blue-500/50 appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">단위</label>
                            <input
                                type="text"
                                value={unit}
                                onChange={(e) => setUnit(e.target.value)}
                                placeholder="분, km"
                                className="w-full bg-[#09090b] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors placeholder-gray-600 focus:ring-1 focus:ring-blue-500/50"
                            />
                        </div>
                    </div>

                    <div className="flex space-x-3 mt-2">
                        {isEditing && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-4 rounded-xl transition-colors border border-red-500/20"
                                title="삭제하기"
                            >
                                <Trash2 size={20} />
                            </button>
                        )}
                        <button
                            type="submit"
                            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-900/30 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center"
                        >
                            {isEditing ? <Check size={20} className="mr-2" /> : <Plus size={20} className="mr-2" />}
                            {isEditing ? '수정 완료' : '할 일 추가하기'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
