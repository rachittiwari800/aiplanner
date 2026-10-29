import React, { useState } from 'react';
import { Sparkles, Send, MoreHorizontal, Maximize2, Minimize2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useChatStore } from '../../store/useChatStore';
import { usePlannerStore } from '../../store/usePlannerStore';
import { chatService } from '../../services/chatService';

export const AIChatWidget: React.FC = () => {
  const { messages, addMessage, isStreaming, setIsStreaming, clearChat } = useChatStore();
  const { formData, selectedDestination } = usePlannerStore();
  const [inputText, setInputText] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const activeDestination = selectedDestination?.name || formData.destination || 'Switzerland';

  const handleSend = async (customText?: string) => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend || isStreaming) return;

    addMessage({
      sender: 'user',
      text: textToSend,
    });

    if (!customText) setInputText('');
    setIsStreaming(true);

    try {
      const response = await chatService.sendMessage(textToSend, {
        destination: activeDestination,
        budget: formData.budgetAmount,
        currency: formData.currency || 'INR',
        travelStyle: formData.travelStyle,
        durationDays: formData.durationDays,
      });

      addMessage({
        sender: 'ai',
        text: response.reply,
      });
    } catch (err: any) {
      addMessage({
        sender: 'ai',
        text: `⚠️ I encountered an issue getting information for ${activeDestination}: ${err?.message || 'Please check your connection and try again.'}`,
      });
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <Card className={`flex flex-col justify-between p-4 transition-all duration-300 ${isExpanded ? 'h-150' : 'h-110'}`}>
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-white leading-tight">
              AI Travel Assistant
            </h3>
            <p className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">
              Planning for {activeDestination}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-gray-400">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg cursor-pointer"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => clearChat()}
            aria-label="Clear chat"
            title="Clear chat"
            className="p-1 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg cursor-pointer"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1 text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[88%] p-3 rounded-2xl leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-purple-600 text-white rounded-br-xs shadow-xs font-medium'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-xs'
              }`}
            >
              <div className="whitespace-pre-line text-xs">{msg.text}</div>
              <span className={`block text-[9px] mt-1 ${msg.sender === 'user' ? 'text-purple-200 text-right' : 'text-gray-400'}`}>
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}
        {isStreaming ? (
          <div className="flex justify-start">
            <div className="bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 p-3 rounded-2xl rounded-bl-xs animate-pulse flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Wayfarer AI is tailoring recommendations...</span>
            </div>
          </div>
        ) : null}
      </div>

      {/* Quick Action Suggestion Buttons */}
      <div className="flex items-center gap-2 py-2 border-t border-gray-100 dark:border-gray-800 overflow-x-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSend(`Show detailed budget breakdown for ${activeDestination}`)}
          className="text-[11px] py-1 px-2.5 rounded-lg border-purple-200 dark:border-purple-900 text-purple-700 dark:text-purple-300 whitespace-nowrap"
        >
          Budget Split
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSend(`What should I pack for ${activeDestination}?`)}
          className="text-[11px] py-1 px-2.5 rounded-lg border-purple-200 dark:border-purple-900 text-purple-700 dark:text-purple-300 whitespace-nowrap"
        >
          Packing List
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSend(`What is the best local food to try in ${activeDestination}?`)}
          className="text-[11px] py-1 px-2.5 rounded-lg border-purple-200 dark:border-purple-900 text-purple-700 dark:text-purple-300 whitespace-nowrap"
        >
          Local Food
        </Button>
      </div>

      {/* Input Box */}
      <div className="relative pt-2">
        <input
          type="text"
          value={inputText}
          disabled={isStreaming}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={`Ask about ${activeDestination}...`}
          className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs rounded-xl pl-3 pr-10 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 disabled:opacity-60"
        />
        <button
          onClick={() => handleSend()}
          disabled={isStreaming || !inputText.trim()}
          className="absolute right-1.5 bottom-1.5 p-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </Card>
  );
};
