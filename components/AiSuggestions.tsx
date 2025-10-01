import React, { useState, useEffect } from 'react';
import { getSalesSuggestions } from '../services/geminiService';
import { AiSuggestion } from '../types';
import { Spinner } from './common/Spinner';

const LightbulbIcon = () => (
    <svg className="w-5 h-5 mr-2 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.657a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 14.95a1 1 0 001.414 1.414l.707-.707a1 1 0 00-1.414-1.414l-.707.707zM4 10a1 1 0 01-1 1H2a1 1 0 110-2h1a1 1 0 011 1zM10 18a1 1 0 011-1v1a1 1 0 11-2 0v-1a1 1 0 011 1zM9.95 5.05a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM10 14a4 4 0 100-8 4 4 0 000 8z"></path></svg>
);
const StrategyIcon = () => (
    <svg className="w-5 h-5 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg>
);
const PromotionIcon = () => (
    <svg className="w-5 h-5 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7a1 1 0 011.414-1.414L10 14.586l6.293-6.293a1 1 0 011.414 0z" clipRule="evenodd"></path><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM3.172 6.172a1 1 0 010-1.414l1.414-1.414A1 1 0 016 3h8a1 1 0 01.707.293l1.414 1.414a1 1 0 010 1.414l-1.414 1.414A1 1 0 0114 8H6a1 1 0 01-.707-.293L3.879 6.121z" clipRule="evenodd"></path></svg>
);


interface AiSuggestionsProps {
    reason: string;
}

export const AiSuggestions: React.FC<AiSuggestionsProps> = ({ reason }) => {
    const [suggestion, setSuggestion] = useState<AiSuggestion | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (reason) {
            const fetchSuggestions = async () => {
                setLoading(true);
                const data = await getSalesSuggestions(reason);
                setSuggestion(data);
                setLoading(false);
            };
            fetchSuggestions();
        } else {
            setSuggestion(null);
        }
    }, [reason]);

    if (!reason) {
        return (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                 <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">💡 Gợi Ý Từ AI</h4>
                 <p className="text-sm text-gray-500 dark:text-gray-400">Nhập "Lý do chưa chốt" để nhận phân tích và gợi ý từ AI.</p>
            </div>
        )
    }

    if (loading) {
        return (
             <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">💡 Gợi Ý Từ AI</h4>
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <Spinner size="h-5 w-5" />
                    <span>Đang phân tích tâm lý khách hàng...</span>
                </div>
            </div>
        );
    }

    if (!suggestion) return null;

    return (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
             <h4 className="font-semibold text-gray-700 dark:text-gray-300">💡 Gợi Ý Từ AI</h4>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <h5 className="flex items-center text-md font-semibold text-gray-800 dark:text-gray-200"><LightbulbIcon/> Phân Tích</h5>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{suggestion.analysis}</p>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <h5 className="flex items-center text-md font-semibold text-gray-800 dark:text-gray-200"><StrategyIcon/> Chiến Lược Tư Vấn</h5>
                <ul className="mt-1 list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    {suggestion.consultingStrategies.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <h5 className="flex items-center text-md font-semibold text-gray-800 dark:text-gray-200"><PromotionIcon/> Ý Tưởng Khuyến Mãi</h5>
                 <ul className="mt-1 list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    {suggestion.promotionIdeas.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
            </div>
        </div>
    );
};
