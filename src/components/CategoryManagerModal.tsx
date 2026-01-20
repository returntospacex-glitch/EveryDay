'use client';

import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

interface CategoryManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    categories: string[];
    onUpdate: (newCategories: string[]) => void;
}

export default function CategoryManagerModal({ isOpen, onClose, categories, onUpdate }: CategoryManagerModalProps) {
    const [newCategory, setNewCategory] = useState('');

    if (!isOpen) return null;

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = newCategory.trim();
        if (!trimmed) return;
        if (categories.includes(trimmed)) {
            alert('이미 존재하는 카테고리입니다.');
            return;
        }
        onUpdate([...categories, trimmed]);
        setNewCategory('');
    };

    const handleDelete = (catToDelete: string) => {
        if (confirm(`'${catToDelete}' 카테고리를 정말 삭제하시겠습니까?`)) {
            onUpdate(categories.filter(c => c !== catToDelete));
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm bg-[#18181b] border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 text-white">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">카테고리 관리</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full hover:bg-white/10">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Add New */}
                    <form onSubmit={handleAdd} className="flex gap-2">
                        <input
                            type="text"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            placeholder="새 카테고리"
                            className="flex-1 bg-[#09090b] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors placeholder-gray-600"
                        />
                        <button
                            type="submit"
                            disabled={!newCategory.trim()}
                            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 rounded-xl transition-colors font-medium"
                        >
                            <Plus size={20} />
                        </button>
                    </form>

                    {/* List */}
                    <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                        {categories.map(cat => (
                            <div key={cat} className="flex justify-between items-center bg-[#09090b] border border-white/5 p-3 rounded-xl group hover:border-white/10 transition-colors">
                                <span className="font-medium text-gray-200">{cat}</span>
                                {cat !== '루틴' && ( // Prevent deleting default 'Routine' or 'All' if we treated 'All' as a category (it's handled separately usually)
                                    <button
                                        onClick={() => handleDelete(cat)}
                                        className="text-gray-600 hover:text-red-400 p-1.5 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                        title="삭제"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
