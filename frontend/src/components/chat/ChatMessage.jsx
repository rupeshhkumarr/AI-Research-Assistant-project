import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import vscDarkPlus from 'react-syntax-highlighter/dist/esm/styles/prism/vsc-dark-plus';
import { User, Bot, FileText, ChevronDown, ChevronRight } from 'lucide-react';

export const ChatMessage = ({ message }) => {
  const isAi = message.role === 'assistant';
  const [sourcesExpanded, setSourcesExpanded] = React.useState(false);

  return (
    <div className={`py-6 px-4 md:px-8 transition-colors duration-300 ${isAi ? 'bg-bg-hover/40 border-y border-border' : 'bg-transparent'}`}>
      <div className="max-w-4xl mx-auto flex gap-4 md:gap-6">
        
        {/* Avatar */}
        <div className="flex-shrink-0 mt-1">
          {isAi ? (
            <div className="w-8 h-8 rounded-sm bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Bot size={18} className="text-white" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-sm bg-bg-hover flex items-center justify-center">
              <User size={18} className="text-text-muted" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          {!isAi && message.isVoice && (
            <div className="flex items-center gap-1.5 w-fit bg-primary-500/10 text-primary-500 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border border-primary-500/20">
              <span>🎤 Voice Message</span>
            </div>
          )}
          <div className="text-text-main prose dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({node, inline, className, children, ...props}) {
                  const match = /language-(\w+)/.exec(className || '')
                  return !inline && match ? (
                    <div className="rounded-md overflow-hidden my-4 border border-border">
                      <div className="flex items-center px-4 py-1.5 bg-bg-card border-b border-border text-xs text-text-muted">
                        {match[1]}
                      </div>
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{ margin: 0, padding: '1rem', background: 'var(--bg-main)' }}
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <code className="bg-bg-hover text-pink-500 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                      {children}
                    </code>
                  )
                }
              }}
            >
              {message.content + (message.isStreaming ? ' ▌' : '')}
            </ReactMarkdown>
          </div>

          {isAi && message.sources && message.sources.length > 0 && (
            <div className="mt-2">
              <button 
                onClick={() => setSourcesExpanded(!sourcesExpanded)}
                className="flex items-center gap-2 text-xs font-medium text-text-muted hover:text-text-main transition-colors"
              >
                {sourcesExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <span>{message.sources.length} Sources Used</span>
              </button>
              
              {sourcesExpanded && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {message.sources.map((source, index) => (
                    <div key={index} className="flex items-center gap-2 bg-bg-card border border-border rounded-md px-3 py-2 text-xs text-text-main shadow-sm max-w-[250px] truncate">
                      <FileText size={12} className="text-primary-500 shrink-0" />
                      <span className="truncate">{source}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
