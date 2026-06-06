import React from 'react';
import { cn } from '../../utils/cn';
import { User, Bot, FileText } from 'lucide-react';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const ChatBubble = ({ message, isAI, sources }) => {
  return (
    <div className={cn("flex gap-4 w-full", isAI ? "justify-start" : "justify-end")}>
      {isAI && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0 mt-1">
          <Bot size={18} className="text-white" />
        </div>
      )}
      
      <div className={cn(
        "flex flex-col gap-2 max-w-[80%]",
        isAI ? "items-start" : "items-end"
      )}>
        <div className={cn(
          "px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed shadow-sm",
          isAI 
            ? "bg-bg-hover text-text-main border border-border rounded-tl-sm prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-bg-card prose-pre:border prose-pre:border-border" 
            : "bg-primary-600 text-white rounded-tr-sm"
        )}>
          {isAI ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message}
            </ReactMarkdown>
          ) : (
            message
          )}
        </div>
        
        {isAI && sources && sources.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {sources.map((source, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-bg-card border border-border text-xs text-text-muted hover:text-primary-500 hover:border-primary-500/30 transition-colors cursor-pointer"
              >
                <FileText size={12} />
                <span>{source}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {!isAI && (
        <div className="w-8 h-8 rounded-full bg-bg-hover flex items-center justify-center shrink-0 mt-1 border border-border">
          <User size={18} className="text-text-muted" />
        </div>
      )}
    </div>
  );
};
