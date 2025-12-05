'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { Button } from '@/components/ui-kit/button';
import { Card, CardContent, CardHeader } from '@/components/ui-kit/card';
import { Input } from '@/components/ui-kit/input';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface ChatPreviewProps {
  messages?: ChatMessage[];
  onClose: () => void;
  onSendMessage?: (message: string) => void;
  isExecuting?: boolean;
  sidebarOffset?: number; // Total right sidebar width (node list or config)
  showTourTip?: boolean; // Show tour tip pointing to this chat preview
  onTourTipClose?: () => void; // Callback when tour tip is closed
}

const MAX_MESSAGE_LENGTH = 200; // Characters before truncation

export default function ChatPreview({
  messages = [],
  onClose,
  onSendMessage,
  isExecuting = false,
  sidebarOffset = 0,
  showTourTip = false,
  onTourTipClose
}: ChatPreviewProps) {
  const [inputValue, setInputValue] = useState('');
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && inputValue.trim() && !isExecuting) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    if (inputValue.trim() && onSendMessage && !isExecuting) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const toggleMessageExpansion = (messageId: string) => {
    setExpandedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  const renderMessageContent = (message: ChatMessage) => {
    const isExpanded = expandedMessages.has(message.id);
    const isLong = message.content.length > MAX_MESSAGE_LENGTH;
    
    if (!isLong) {
      return <div className="whitespace-pre-wrap break-words">{message.content}</div>;
    }

    const displayContent = isExpanded 
      ? message.content 
      : message.content.substring(0, MAX_MESSAGE_LENGTH) + '...';

    return (
      <div>
        <div className="whitespace-pre-wrap break-words">{displayContent}</div>
        <button
          onClick={() => toggleMessageExpansion(message.id)}
          className="mt-2 text-xs underline opacity-70 hover:opacity-100 transition-opacity"
          style={{ color: 'inherit' }}
        >
          {isExpanded ? 'Read less' : 'Read more'}
        </button>
      </div>
    );
  };

  // If no messages, show the old format for backward compatibility
  if (messages.length === 0) {
    const userMessage = messages.find(m => m.type === 'user')?.content;
    const botMessage = messages.find(m => m.type === 'bot')?.content;

    if (!userMessage && !botMessage) return null;

    // Calculate right position based on sidebar state (selection or config)
    const rightPosition = sidebarOffset + 16; // 16px = 1rem margin
    
    return (
      <>
        <div 
          ref={containerRef}
          className="fixed bottom-4 z-50 w-[380px] max-w-[90vw] transition-all duration-300 ease-in-out"
          style={{ right: `${rightPosition}px` }}
          data-chat-preview="true"
        >
          <Card className="shadow-2xl overflow-hidden backdrop-blur-sm">
            {/* Header */}
            <CardHeader className="flex flex-row items-center justify-between px-4 py-3 border-b border-[var(--border-color)] bg-[var(--card-hover)]/50">
              <div className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Run preview</div>
              <Button
                onClick={onClose}
                variant="outline"
                size="icon"
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            {/* Messages */}
            <CardContent className="p-4 space-y-4 max-h-[40vh] overflow-y-auto">
              {userMessage && (
                <div className="flex justify-end">
                  <div
                    className="max-w-[80%] rounded-[5px] px-4 py-2.5 text-sm relative overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                      border: '1.5px solid #22d3ee',
                      color: '#ffffff',
                      boxShadow: '0 4px 12px rgba(6, 182, 212, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    {userMessage}
                  </div>
                </div>
              )}
              {botMessage && (
                <div className="flex justify-start">
                  <div
                    className="max-w-[80%] rounded-[5px] px-4 py-2.5 text-sm relative overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, #1f1f1f 0%, #27272a 100%)',
                      border: '1.5px solid #10b981',
                      color: '#ffffff',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    {botMessage}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Tour Tip - positioned relative to chat preview */}
        {showTourTip && (
          <div className="fixed inset-0 z-[70] pointer-events-none">
            {/* Overlay - subtle, only blocks interactions */}
            <div 
              className="absolute inset-0 bg-black/20"
              style={{ pointerEvents: 'auto' }}
              onClick={onTourTipClose}
            />
            
            {/* Tour tip pointing to ChatPreview */}
            <div 
              className="fixed z-[71] pointer-events-none"
              style={{
                left: typeof window !== 'undefined' 
                  ? `${Math.max(16, window.innerWidth - rightPosition - 380 - 304)}px` // Position to the left of chat preview (380px chat width + 288px tip width + 16px margin)
                  : '16px',
                bottom: '4rem', // Align with chat preview bottom
                transform: 'translateY(50%)' // Center vertically with chat preview
              }}
            >
              <div className="relative w-72 rounded-lg border border-[var(--primary)]/40 bg-gradient-to-r from-[var(--primary)]/10 to-[var(--primary)]/5 px-3 py-2.5 text-xs shadow-lg pointer-events-auto">
                {/* Arrow pointing right to ChatPreview */}
                <div 
                  className="absolute top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-[8px] border-b-[8px] border-l-[8px] border-t-transparent border-b-transparent border-l-[var(--primary)]/40"
                  style={{
                    right: '-8px' // Arrow tip points to chat preview
                  }}
                ></div>
                <p className="font-semibold text-[var(--foreground)] mb-1">
                  Step 7 · Chat Preview
                </p>
                <p className="text-[var(--text-muted)] mb-2">
                  Users can see their <span className="font-semibold">chat preview</span> here for testing and debugging. <span className="font-semibold">Tour complete! 🎉</span>
                </p>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={onTourTipClose}
                    className="text-[11px] font-medium px-2 py-1 rounded bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]"
                  >
                    Got it!
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Calculate right position based on sidebar state (selection or config)
  const rightPosition = sidebarOffset + 16; // 16px = 1rem margin

  return (
    <>
      <div 
        ref={containerRef}
        className="fixed bottom-4 z-50 w-[380px] max-w-[90vw] transition-all duration-300 ease-in-out"
        style={{ right: `${rightPosition}px` }}
        data-chat-preview="true"
      >
        <Card className="shadow-2xl overflow-hidden backdrop-blur-sm">
          {/* Header */}
          <CardHeader className="flex flex-row items-center justify-between px-4 py-3 border-b border-[var(--border-color)] bg-[var(--card-hover)]/50">
            <div className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Chat Preview</div>
            <Button
              onClick={onClose}
              variant="outline"
              size="icon"
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          {/* Messages */}
          <CardContent className="p-4 space-y-4 max-h-[40vh] overflow-y-auto">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className="max-w-[80%] rounded-[5px] px-4 py-2.5 text-sm relative overflow-hidden"
                  style={{
                    background: message.type === 'user'
                      ? 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)'
                      : 'linear-gradient(135deg, #1f1f1f 0%, #27272a 100%)',
                    border: message.type === 'user'
                      ? '1.5px solid #22d3ee'
                      : '1.5px solid #10b981',
                    color: '#ffffff',
                    boxShadow: message.type === 'user'
                      ? '0 4px 12px rgba(6, 182, 212, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                      : '0 4px 12px rgba(16, 185, 129, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                  }}
                >
                  {renderMessageContent(message)}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Input Area */}
          {onSendMessage && (
            <div className="p-4 border-t border-[var(--border-color)] bg-[var(--card-hover)]/30">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isExecuting ? "Executing..." : "Ask a follow-up question..."}
                  disabled={isExecuting}
                  className="flex-1 text-sm"
                  style={{
                    background: 'var(--background)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--foreground)'
                  }}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isExecuting}
                  size="icon"
                  className="h-10 w-10 shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
      
      {/* Tour Tip - positioned relative to chat preview */}
      {showTourTip && (
        <div className="fixed inset-0 z-[70] pointer-events-none">
          {/* Overlay - subtle, only blocks interactions */}
          <div 
            className="absolute inset-0 bg-black/20"
            style={{ pointerEvents: 'auto' }}
            onClick={onTourTipClose}
          />
          
          {/* Tour tip pointing to ChatPreview */}
          <div 
            className="fixed z-[71] pointer-events-none"
            style={{
              left: typeof window !== 'undefined' 
                ? `${Math.max(16, window.innerWidth - rightPosition - 380 - 300)}px` // Position to the left of chat preview
                : '16px',
              bottom: '4rem', // Align with chat preview bottom
              transform: 'translateY(50%)' // Center vertically with chat preview
            }}
          >
            <div className="relative w-72 rounded-lg border border-[var(--primary)]/40 bg-gradient-to-r from-[var(--primary)]/10 to-[var(--primary)]/5 px-3 py-2.5 text-xs shadow-lg pointer-events-auto">
              {/* Arrow pointing right to ChatPreview */}
              <div 
                className="absolute top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-[8px] border-b-[8px] border-l-[8px] border-t-transparent border-b-transparent border-l-[var(--primary)]/40"
                style={{
                  right: '-8px' // Arrow tip points to chat preview
                }}
              ></div>
              <p className="font-semibold text-[var(--foreground)] mb-1">
                Step 7 · Chat Preview
              </p>
              <p className="text-[var(--text-muted)] mb-2">
                Users can see their <span className="font-semibold">chat preview</span> here for testing and debugging. <span className="font-semibold">Tour complete! 🎉</span>
              </p>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onTourTipClose}
                  className="text-[11px] font-medium px-2 py-1 rounded bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]"
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


