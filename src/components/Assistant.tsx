import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Sparkles, X } from 'lucide-react';
import { useTranslation, TranslationKey } from '../lib/translations';
import { DocLanguage } from '../types/core';

interface AssistantProps {
  model?: string;
  documentation?: string;
  onUpdateDocumentation?: (updatedDocumentation: string) => void;
}

export default function Assistant({
  model = 'gpt-4o-mini',
  documentation,
  onUpdateDocumentation,
}: AssistantProps) {
  // Get language from localStorage and react to changes
  const [selectedLanguage, setSelectedLanguage] = useState<DocLanguage>(() => {
    const saved = localStorage.getItem('selectedLanguage');
    return (saved as DocLanguage) || 'en';
  });

  // Listen for language changes in localStorage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'selectedLanguage' && e.newValue) {
        setSelectedLanguage(e.newValue as DocLanguage);
      }
    };

    // Listen for storage events (when changed in other tabs/windows)
    window.addEventListener('storage', handleStorageChange);

    // Listen for custom language change events (for same-tab changes)
    const handleLanguageChange = () => {
      const saved = localStorage.getItem('selectedLanguage');
      if (saved && saved !== selectedLanguage) {
        setSelectedLanguage(saved as DocLanguage);
      }
    };

    window.addEventListener('languageChanged', handleLanguageChange);

    // Check on window focus (when user switches back to tab)
    const handleFocus = () => {
      const saved = localStorage.getItem('selectedLanguage');
      if (saved && saved !== selectedLanguage) {
        setSelectedLanguage(saved as DocLanguage);
      }
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('languageChanged', handleLanguageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [selectedLanguage]);

  const t = useTranslation(selectedLanguage);

  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; timestamp?: number }>>([]);
  
  // Initialize with proactive recommendations
  const generateInitialRecommendations = useCallback(() => {
    if (documentation && onUpdateDocumentation) {
      // Documentation editing mode
    setMessages([{
      role: 'assistant',
        content: `Hi! I'm your AI assistant. I can help you edit and improve your documentation.`,
      timestamp: Date.now(),
    }]);
    }
  }, [documentation, onUpdateDocumentation, t]);
  
  useEffect(() => {
    if (messages.length === 0 && documentation && onUpdateDocumentation) {
      generateInitialRecommendations();
    }
  }, [messages.length, documentation, onUpdateDocumentation, generateInitialRecommendations]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage, timestamp: Date.now() }]);
    setLoading(true);

    try {
      // Check if we're in documentation editing mode
      if (documentation && onUpdateDocumentation) {
        // Determine if this is an edit request or just a conversation
        const isEditRequest = isDocumentationEditRequest(userMessage);
        
        if (isEditRequest) {
          // User explicitly wants to edit - process the edit
        const response = await processDocumentationEditRequest(userMessage, documentation, model, t);
        
        if (response.updatedDocumentation) {
          onUpdateDocumentation(response.updatedDocumentation);
        }
        
        setMessages((prev) => [...prev, { 
          role: 'assistant', 
          content: response.message, 
          timestamp: Date.now() 
        }]);
        } else {
          // User wants to chat about the documentation - have a conversation
          const response = await processConversationalRequest(userMessage, documentation, model, t, messages);
          
          setMessages((prev) => [...prev, { 
            role: 'assistant', 
            content: response, 
            timestamp: Date.now() 
          }]);
        }
        setLoading(false);
        return;
        setLoading(false);
        return;
      }
      
      // If no documentation mode, show error
      setMessages((prev) => [...prev, { 
        role: 'assistant', 
        content: t('assistantErrorNoDocumentation'), 
        timestamp: Date.now() 
      }]);
      setLoading(false);
    } catch (error: any) {
      console.error('Assistant error:', error);
      const errorMessage = error.message || t('unknownErrorOccurred');
      
      // Provide helpful error messages
      let userFriendlyMessage = `${t('assistantErrorUnknown')}: ${errorMessage}`;
      
      if (errorMessage.includes('API key')) {
        userFriendlyMessage = t('assistantErrorApiKey');
      } else if (errorMessage.includes('parse') || errorMessage.includes('JSON')) {
        userFriendlyMessage = t('assistantErrorParse');
      } else if (errorMessage.includes('timeout') || errorMessage.includes('network')) {
        userFriendlyMessage = t('assistantErrorNetwork');
      }
      
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: userFriendlyMessage,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 via-white to-orange-50/30 overflow-hidden">
      {/* Header - Modern Glassmorphism */}
      <div className="glass p-5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl blur opacity-30"></div>
            <div className="relative bg-gradient-to-r from-orange-500 to-red-600 p-2.5 rounded-xl shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <h3 className="font-black text-slate-800 text-lg">{t('aiAssistant')}</h3>
            <p className="text-xs text-slate-500 font-medium">{t('documentationHelper')}</p>
          </div>
        </div>
        {messages.length > 1 && (
          <button
            onClick={() => {
              if (confirm(t('clearConversationHistoryConfirm'))) {
                generateInitialRecommendations();
              }
            }}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-slate-700"
            title={t('assistantClearConversation')}
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Messages Area - Enhanced Design */}
      <div className="flex-1 overflow-y-auto p-5 lg:p-6 space-y-5 min-h-0 overscroll-contain scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-sm">
              <div className="relative mx-auto w-20 h-20 mb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-full blur-xl opacity-30"></div>
                <div className="relative bg-gradient-to-r from-orange-500 to-red-600 p-4 rounded-full">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
              </div>
              <h4 className="text-lg font-semibold text-slate-700 mb-2">{t('readyToHelp')}</h4>
              <p className="text-sm text-slate-500 mb-4">{t('iCanHelpEditDocumentation')}</p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-xs font-medium">✏️ {t('editSections')}</span>
                <span className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-medium">✨ {t('improveClarity')}</span>
                <span className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-xs font-medium">📝 {t('fixGrammar')}</span>
              </div>
            </div>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-5 py-4 shadow-xl ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-orange-600 to-red-600 text-white'
                  : 'glass text-slate-800'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-200/50">
                  <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-slate-600">{t('aiAssistant')}</span>
                </div>
              )}
              <div className="text-sm whitespace-pre-wrap leading-relaxed">
                {msg.content.split('\n').map((line, lineIdx) => {
                  // Highlight headers
                  if (line.match(/^#{1,3}\s+/)) {
                    const level = line.match(/^#+/)?.[0].length || 1;
                    const text = line.replace(/^#+\s+/, '');
                    const className = level === 1 
                      ? 'text-base font-bold mt-3 mb-2 text-slate-800' 
                      : level === 2 
                      ? 'text-sm font-semibold mt-2 mb-1 text-slate-700' 
                      : 'text-sm font-medium mt-1 text-slate-600';
                    return (
                      <div key={lineIdx} className={className}>
                        {text}
                      </div>
                    );
                  }
                  // Highlight "Changes Made:" section
                  if (line.includes('📋 **Changes Made:**')) {
                    return (
                      <div key={lineIdx} className="mt-3 pt-3 border-t border-slate-300/50">
                        <strong className="font-semibold text-slate-800 flex items-center gap-2">
                          <span>📋</span>
                          <span>{line.replace(/\*\*/g, '')}</span>
                        </strong>
                      </div>
                    );
                  }
                  // Style change items with emojis
                  if (line.trim().match(/^(✅|🔄|🎨|🗑️|💡|📊|🚀)/)) {
                    return (
                      <div key={lineIdx} className="mt-2 font-medium text-slate-700 flex items-start gap-2">
                        <span className="text-lg">{line.trim().charAt(0)}</span>
                        <span>{line.trim().substring(1).trim()}</span>
                      </div>
                    );
                  }
                  // Style bold text
                  if (line.includes('**')) {
                    const parts = line.split(/(\*\*[^*]+\*\*)/g);
                    return (
                      <div key={lineIdx} className="my-1">
                        {parts.map((part, partIdx) => {
                          if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={partIdx} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
                          }
                          return <span key={partIdx}>{part}</span>;
                        })}
                      </div>
                    );
                  }
                  // Style bullet points
                  if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
                    return (
                      <div key={lineIdx} className="ml-4 text-slate-700 my-1 flex items-start gap-2">
                        <span className="text-orange-500 mt-1 font-bold">•</span>
                        <span>{line.trim().substring(1).trim()}</span>
                      </div>
                    );
                  }
                  // Regular text
                  return <div key={lineIdx} className="my-1 text-slate-700">{line || '\u00A0'}</div>;
                })}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start animate-in fade-in">
            <div className="bg-white/90 backdrop-blur-sm border border-slate-200/50 rounded-2xl px-4 py-3 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-orange-600 animate-pulse" />
                  <span className="text-sm font-medium text-slate-700">{t('aiIsThinking')}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Modern Design */}
      <div className="glass p-5 flex-shrink-0">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !loading && input.trim()) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={loading ? t('assistantPlaceholderLoading') : t('assistantPlaceholderReady')}
              className="input-modern"
              disabled={loading}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="btn-primary px-6 py-3 flex items-center gap-2"
            title={input.trim() ? t('assistantTitleSend') : t('assistantTitleType')}
          >
            {loading ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span className="text-sm hidden sm:inline">{t('generating')}</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">{t('send')}</span>
              </>
            )}
          </button>
        </div>
        <div className="mt-2 text-xs text-slate-500 flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1">
            <span>💡</span>
            <span>{t('beSpecificForBetterResults')}</span>
          </span>
          <span className="hidden sm:inline flex items-center gap-1">
            <span>⌨️</span>
            <span>{t('pressEnterToSend')}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Determine if a message is an explicit edit request or just conversational
 */
function isDocumentationEditRequest(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  
  // Explicit edit commands
  const editKeywords = [
    'edit', 'change', 'update', 'modify', 'rewrite', 'fix', 'correct',
    'add', 'remove', 'delete', 'insert', 'replace', 'improve', 'enhance',
    'make it', 'make the', 'change the', 'update the', 'edit the',
    'should be', 'needs to be', 'must be', 'please add', 'please remove',
    'can you add', 'can you remove', 'can you change', 'can you edit'
  ];
  
  // Check if message contains edit keywords
  const hasEditKeyword = editKeywords.some(keyword => lowerMessage.includes(keyword));
  
  // Check for imperative patterns (commands)
  const isCommand = lowerMessage.startsWith('edit') || 
                    lowerMessage.startsWith('change') || 
                    lowerMessage.startsWith('update') ||
                    lowerMessage.startsWith('add') ||
                    lowerMessage.startsWith('remove') ||
                    lowerMessage.startsWith('fix') ||
                    lowerMessage.startsWith('rewrite');
  
  // If it's a question, it's conversational
  const isQuestion = lowerMessage.trim().endsWith('?') || 
                     lowerMessage.includes('what') ||
                     lowerMessage.includes('how') ||
                     lowerMessage.includes('why') ||
                     lowerMessage.includes('when') ||
                     lowerMessage.includes('where') ||
                     lowerMessage.includes('can you explain') ||
                     lowerMessage.includes('tell me') ||
                     lowerMessage.includes('describe');
  
  // If it's a greeting or casual chat, it's conversational
  const isCasual = lowerMessage.includes('hello') ||
                   lowerMessage.includes('hi') ||
                   lowerMessage.includes('thanks') ||
                   lowerMessage.includes('thank you') ||
                   lowerMessage.includes('ok') ||
                   lowerMessage.includes('okay') ||
                   lowerMessage.length < 10; // Very short messages are likely conversational
  
  // If it's clearly a question or casual, it's conversational
  if (isQuestion || isCasual) {
    return false;
  }
  
  // If it has edit keywords or is a command, it's an edit request
  return hasEditKeyword || isCommand;
}

/**
 * Process conversational requests (chatting about documentation)
 */
async function processConversationalRequest(
  request: string,
  currentDocumentation: string,
  model: string = 'gpt-4o-mini',
  t?: (key: TranslationKey) => string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string; timestamp?: number }> = []
): Promise<string> {
  const { callLangChain } = await import('../lib/langchain-service');
  
  // Build conversation context
  const conversationContext = conversationHistory
    .slice(-6) // Last 6 messages for context
    .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
    .join('\n\n');
  
  const systemPrompt = `You are a helpful AI assistant that helps users understand and discuss their documentation. You can:
- Answer questions about the documentation
- Explain sections or concepts
- Provide suggestions and recommendations
- Discuss the documentation content
- Help users understand what's in their documentation

IMPORTANT: You are having a CONVERSATION. Do NOT edit or modify the documentation unless the user explicitly asks you to edit it. Just discuss, explain, and provide helpful information.

Be friendly, conversational, and helpful. If the user asks about something specific in the documentation, reference it. If they ask for suggestions, provide them without making changes.

HELPFUL HINTS TO SHARE:
- When appropriate, mention that users can edit the documentation by using commands like: "edit", "change", "update", "add", "remove", "fix", "rewrite", "improve", "enhance"
- Mention that they can use phrases like: "edit the...", "change the...", "add a section about...", "remove the...", "fix the grammar", "update the..."
- Let users know that questions and casual chat won't trigger edits - only explicit edit commands will modify the documentation
- Be helpful and guide users on how to use the assistant effectively`;

  const prompt = `The user is having a conversation about their documentation. Here's the conversation so far:

${conversationContext ? `Previous conversation:\n${conversationContext}\n\n` : ''}

User's current message: "${request}"

Current documentation (for reference - you can discuss it but don't edit unless explicitly asked):
\`\`\`
${currentDocumentation.substring(0, 3000)}${currentDocumentation.length > 3000 ? '\n\n[... documentation continues ...]' : ''}
\`\`\`

Please respond conversationally to the user's message. If they're asking about the documentation, help them understand it. If they're asking for suggestions, provide helpful recommendations. Be friendly and helpful, but remember: you're just chatting, not editing unless they explicitly ask you to edit.

IMPORTANT: When appropriate (especially in your first response or when the user seems unsure), helpfully mention:
- "💡 Tip: To edit the documentation, use commands like: 'edit', 'change', 'update', 'add', 'remove', 'fix', 'rewrite', 'improve', or 'enhance'"
- "You can say things like: 'edit the introduction', 'add a section about X', 'fix the grammar', 'update the API docs', etc."
- "Questions and casual chat won't modify your documentation - only explicit edit commands will make changes"

Be natural and conversational, but include these helpful hints when it makes sense in the conversation.`;

  try {
    const response = await callLangChain(
      prompt, 
      systemPrompt, 
      model, 
      0.7,
      undefined, // No repoName - we're not using RAG
      false, // Don't use RAG for conversation
      2048 // Reasonable max tokens for conversation
    );
    
    return response.trim();
  } catch (error: any) {
    console.error('[Assistant] Error processing conversational request:', error);
    const errorMsg = t ? `${t('assistantErrorUnknown')}: ${error.message}` : `Error: ${error.message}`;
    return errorMsg;
  }
}

/**
 * Process documentation editing requests
 */
async function processDocumentationEditRequest(
  request: string,
  currentDocumentation: string,
  model: string = 'gpt-4o-mini',
  t?: (key: TranslationKey) => string
): Promise<{ message: string; updatedDocumentation?: string }> {
  const { callLangChain } = await import('../lib/langchain-service');
  
  const systemPrompt = `You are a helpful AI assistant specialized in editing and improving documentation. Your role is to help users edit, improve, and refine their documentation text.

YOUR CAPABILITIES:
- Rewrite sections for better clarity
- Improve grammar, spelling, and style
- Add missing information
- Remove unnecessary content
- Restructure documentation for better flow
- Format text properly
- Make content more professional and readable

YOUR APPROACH:
- Preserve the original structure and meaning
- Make improvements while keeping the user's intent
- Be clear about what changes you made
- Maintain markdown formatting
- Keep technical accuracy`;

  const prompt = `The user wants to edit their documentation. Here's their request:

"${request}"

Current documentation:
\`\`\`
${currentDocumentation}
\`\`\`

Please:
1. Understand what the user wants to change
2. Edit the documentation accordingly
3. Return the complete updated documentation
4. Explain briefly what you changed

Return your response in this format:
<explanation>
Brief explanation of what you changed
</explanation>

<documentation>
[Complete updated documentation here]
</documentation>`;

  try {
    // Call LangChain without RAG (we're editing documentation, not analyzing code)
    // Use reasonable maxTokens for documentation editing (4096 should be enough)
    const response = await callLangChain(
      prompt, 
      systemPrompt, 
      model, 
      0.7,
      undefined, // No repoName - we're not using RAG
      false, // Don't use RAG for documentation editing
      4096 // Reasonable max tokens for editing
    );
    
    // Extract explanation and documentation
    const explanationMatch = response.match(/<explanation>([\s\S]*?)<\/explanation>/);
    const docMatch = response.match(/<documentation>([\s\S]*?)<\/documentation>/);
    
    const explanation = explanationMatch ? explanationMatch[1].trim() : 'I\'ve updated your documentation.';
    const updatedDoc = docMatch ? docMatch[1].trim() : currentDocumentation;

  return {
      message: explanation,
      updatedDocumentation: updatedDoc,
    };
  } catch (error: any) {
    console.error('[Assistant] Error processing documentation edit:', error);
    const errorMsg = t ? `${t('errorEditingDocumentation')}: ${error.message}` : `Error editing documentation: ${error.message}`;
    return {
      message: errorMsg,
      updatedDocumentation: currentDocumentation,
    };
  }
}
