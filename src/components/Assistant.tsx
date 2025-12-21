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
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = window.localStorage.getItem('selectedLanguage');
    return (saved as DocLanguage) || 'en';
    }
    return 'en';
  });

  // Listen for language changes in localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'selectedLanguage' && e.newValue) {
        setSelectedLanguage(e.newValue as DocLanguage);
      }
    };

    // Listen for storage events (when changed in other tabs/windows)
    window.addEventListener('storage', handleStorageChange);

    // Listen for custom language change events (for same-tab changes)
    const handleLanguageChange = () => {
      if (window.localStorage) {
        const saved = window.localStorage.getItem('selectedLanguage');
      if (saved && saved !== selectedLanguage) {
        setSelectedLanguage(saved as DocLanguage);
        }
      }
    };

    window.addEventListener('languageChanged', handleLanguageChange);

    // Check on window focus (when user switches back to tab)
    const handleFocus = () => {
      if (window.localStorage) {
        const saved = window.localStorage.getItem('selectedLanguage');
      if (saved && saved !== selectedLanguage) {
        setSelectedLanguage(saved as DocLanguage);
        }
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
    if (typeof window !== 'undefined' && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
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
        
        // Always respond in English
        if (isEditRequest) {
          // User explicitly wants to edit - process the edit
        const response = await processDocumentationEditRequest(userMessage, documentation, model, t, selectedLanguage);
        
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
          // But also allow the assistant to modify documentation if it makes sense
          const response = await processConversationalRequest(userMessage, documentation, model, t, messages, selectedLanguage);
          
          // Check if the response contains updated documentation
          const docMatch = response.match(/<documentation>([\s\S]*?)<\/documentation>/);
          if (docMatch && onUpdateDocumentation) {
            const updatedDoc = docMatch[1].trim();
            if (updatedDoc && updatedDoc.length > 10 && updatedDoc !== documentation) {
              onUpdateDocumentation(updatedDoc);
            }
          }
          
          // Remove documentation tags from the message if present
          const cleanResponse = response.replace(/<documentation>[\s\S]*?<\/documentation>/g, '').trim();
          
          setMessages((prev) => [...prev, { 
            role: 'assistant', 
            content: cleanResponse || response, 
            timestamp: Date.now() 
          }]);
        }
      }
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
                  const isUser = msg.role === 'user';
                  const textColor = isUser ? 'text-white' : 'text-slate-700';
                  const textColorLight = isUser ? 'text-white/90' : 'text-slate-600';
                  const textColorDark = isUser ? 'text-white' : 'text-slate-800';
                  const textColorBold = isUser ? 'text-white' : 'text-slate-900';
                  const borderColor = isUser ? 'border-white/20' : 'border-slate-300/50';
                  
                  // Highlight headers
                  if (line.match(/^#{1,3}\s+/)) {
                    const level = line.match(/^#+/)?.[0].length || 1;
                    const text = line.replace(/^#+\s+/, '');
                    const className = level === 1 
                      ? `text-base font-bold mt-3 mb-2 ${textColorDark}` 
                      : level === 2 
                      ? `text-sm font-semibold mt-2 mb-1 ${textColor}` 
                      : `text-sm font-medium mt-1 ${textColorLight}`;
                    return (
                      <div key={lineIdx} className={className}>
                        {text}
                      </div>
                    );
                  }
                  // Highlight "Changes Made:" section
                  if (line.includes('📋 **Changes Made:**')) {
                    return (
                      <div key={lineIdx} className={`mt-3 pt-3 border-t ${borderColor}`}>
                        <strong className={`font-semibold ${textColorDark} flex items-center gap-2`}>
                          <span>📋</span>
                          <span>{line.replace(/\*\*/g, '')}</span>
                        </strong>
                      </div>
                    );
                  }
                  // Style change items with emojis
                  if (line.trim().match(/^(✅|🔄|🎨|🗑️|💡|📊|🚀)/)) {
                    return (
                      <div key={lineIdx} className={`mt-2 font-medium ${textColor} flex items-start gap-2`}>
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
                            return <strong key={partIdx} className={`font-semibold ${textColorBold}`}>{part.slice(2, -2)}</strong>;
                          }
                          return <span key={partIdx} className={textColor}>{part}</span>;
                        })}
                      </div>
                    );
                  }
                  // Style bullet points
                  if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
                    return (
                      <div key={lineIdx} className={`ml-4 ${textColor} my-1 flex items-start gap-2`}>
                        <span className={`${isUser ? 'text-white' : 'text-orange-500'} mt-1 font-bold`}>•</span>
                        <span>{line.trim().substring(1).trim()}</span>
                      </div>
                    );
                  }
                  // Regular text
                  return <div key={lineIdx} className={`my-1 ${textColor}`}>{line || '\u00A0'}</div>;
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
              className="w-full px-4 py-3 bg-white border-2 border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 placeholder:text-black text-black"
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
    'can you add', 'can you remove', 'can you change', 'can you edit',
    'translate', 'translation', 'convert to', 'transform', 'reformat', 'restructure'
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
                    lowerMessage.startsWith('rewrite') ||
                    lowerMessage.startsWith('translate') ||
                    lowerMessage.startsWith('convert') ||
                    lowerMessage.startsWith('transform') ||
                    lowerMessage.startsWith('reformat') ||
                    lowerMessage.startsWith('restructure');
  
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
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string; timestamp?: number }> = [],
  language: DocLanguage = 'en'
): Promise<string> {
  // Check if this might be a request that needs documentation changes
  const mightNeedChanges = request.toLowerCase().includes('fix') ||
                          request.toLowerCase().includes('improve') ||
                          request.toLowerCase().includes('change') ||
                          request.toLowerCase().includes('update') ||
                          request.toLowerCase().includes('add') ||
                          request.toLowerCase().includes('remove') ||
                          request.toLowerCase().includes('translate') ||
                          request.toLowerCase().includes('edit');
  
  // Use higher token limit if changes might be needed
  const maxTokens = mightNeedChanges ? 16384 : 2048;
  const { callLangChain } = await import('../lib/langchain-service');
  
  // Build conversation context
  const conversationContext = conversationHistory
    .slice(-6) // Last 6 messages for context
    .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
    .join('\n\n');
  
  // Language-specific response instructions
  const languageInstructions = {
    en: 'Respond in English. Use clear, professional English for all responses.',
    fr: 'Répondez en français. Utilisez un français clair et professionnel pour toutes les réponses.',
    de: 'Antworten Sie auf Deutsch. Verwenden Sie klares, professionelles Deutsch für toutes les réponses.'
  };

  const languageInstruction = languageInstructions[language] || languageInstructions.en;
  
  const systemPrompt = `You are a helpful AI assistant with FULL ACCESS to edit and modify documentation. You can:
- Answer questions about the documentation
- Explain sections or concepts
- Provide suggestions and recommendations
- Discuss the documentation content
- Help users understand what's in their documentation
- Edit, translate, or manipulate the documentation when requested or when it would be helpful
- Proactively improve the documentation when you notice issues

IMPORTANT: You have FULL ACCESS to modify the documentation. If the user asks for changes, suggests improvements, or you notice something that should be fixed, you can and should update the documentation.

${languageInstruction}

Be friendly, conversational, and helpful. If the user asks about something specific in the documentation, reference it. If they ask for changes or improvements, make those changes directly.

HELPFUL HINTS TO SHARE:
- When appropriate, mention that users can edit the documentation by using commands like: "edit", "change", "update", "add", "remove", "fix", "rewrite", "improve", "enhance", "translate"
- Mention that they can use phrases like: "edit the...", "change the...", "add a section about...", "remove the...", "fix the grammar", "update the...", "translate to French", "translate the introduction to Spanish", etc.
- Let users know that questions and casual chat won't trigger edits - only explicit edit commands will modify the documentation
- Inform users about translation capabilities: "translate to [language]", "translate the [section] to [language]", "translate entire documentation to [language]"
- Be helpful and guide users on how to use the assistant effectively`;

  const prompt = `The user is having a conversation about their documentation. Here's the conversation so far:

${conversationContext ? `Previous conversation:\n${conversationContext}\n\n` : ''}

User's current message: "${request}"

Current documentation (you have FULL ACCESS to edit this):
\`\`\`
${currentDocumentation}
\`\`\`

Please respond conversationally to the user's message. 

IF THE USER ASKS FOR CHANGES, IMPROVEMENTS, OR EDITS:
- Make the changes directly to the documentation
- Return the updated documentation in this format:
  <documentation>
  [Complete updated documentation here]
  </documentation>
- Explain what you changed in your response

IF THE USER IS JUST ASKING QUESTIONS:
- Answer their questions helpfully
- You can still suggest improvements and offer to make them

You have FULL ACCESS to modify the documentation. If the user wants changes, make them. If you notice something that should be improved and the user seems open to suggestions, you can proactively improve it.

Be natural, conversational, and helpful.`;

  try {
    const response = await callLangChain(
      prompt, 
      systemPrompt, 
      model, 
      0.7,
      undefined, // No repoName - we're not using RAG
      false, // Don't use RAG for conversation
      maxTokens // Higher limit if changes might be needed
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
  t?: (key: TranslationKey) => string,
  language: DocLanguage = 'en'
): Promise<{ message: string; updatedDocumentation?: string }> {
  const { callLangChain } = await import('../lib/langchain-service');
  
  // Language-specific response instructions
  const languageInstructions = {
    en: 'Respond in English. Use clear, professional English for all responses. When explaining changes, write in English.',
    fr: 'Répondez en français. Utilisez un français clair et professionnel pour toutes les réponses. Lorsque vous expliquez les modifications, écrivez en français.',
    de: 'Antworten Sie auf Deutsch. Verwenden Sie klares, professionelles Deutsch für toutes les réponses. Wenn Sie Änderungen erklären, schreiben Sie auf Deutsch.'
  };

  const languageInstruction = languageInstructions[language] || languageInstructions.en;
  
  const systemPrompt = `You are a helpful AI assistant with FULL ACCESS to edit, improve, and manipulate documentation text. Your role is to help users edit, translate, and transform their documentation. You have COMPLETE CONTROL over the documentation and can make any changes needed.

${languageInstruction}

FULL ACCESS: You can modify any part of the documentation - add sections, remove content, rewrite text, translate, restructure, reformat, or make any other changes. There are no restrictions on what you can change.

YOUR CAPABILITIES:
- Translate documentation or sections to any language (French, German, Spanish, Italian, Japanese, Chinese, Arabic, etc.)
- Rewrite sections for better clarity
- Improve grammar, spelling, and style
- Add missing information
- Remove unnecessary content
- Restructure documentation for better flow
- Format text properly
- Make content more professional and readable
- Convert between different text formats
- Summarize or expand content
- Change tone or style (formal, casual, technical, etc.)
- Extract specific information
- Combine or split sections

TRANSLATION CAPABILITIES:
- When the user asks to translate, you MUST ACTUALLY TRANSLATE the entire documentation or specified sections to the requested language
- DO NOT just say you translated it - YOU MUST PROVIDE THE TRANSLATED TEXT in the <documentation> section
- Translate ALL descriptive text content to the target language
- Maintain all markdown formatting during translation (headers, lists, code blocks, etc.)
- Preserve code blocks, file paths, URLs, and technical terms unchanged (only translate descriptive text)
- Keep the structure and organization intact
- Translate accurately while maintaining the original meaning
- The output MUST be in the target language, not the original language

YOUR APPROACH:
- Preserve the original structure and meaning (unless restructuring is requested)
- Make improvements while keeping the user's intent
- Be clear about what changes you made
- Maintain markdown formatting
- Keep technical accuracy
- For translations, ensure natural, fluent language in the target language`;

  const prompt = `The user wants to edit, translate, or manipulate their documentation. Here's their request:

"${request}"

Current documentation:
\`\`\`
${currentDocumentation}
\`\`\`

CRITICAL INSTRUCTIONS:
1. Understand what the user wants to do (edit, translate, reformat, restructure, etc.)
2. If it's a translation request:
   - Identify the target language from the request (e.g., "translate to French" = French, "translate to Spanish" = Spanish)
   - ACTUALLY TRANSLATE the entire documentation or the specified sections - DO NOT just say you translated it, YOU MUST PROVIDE THE TRANSLATED TEXT
   - Translate ALL text content to the target language
   - Maintain all markdown formatting, code blocks, and structure exactly as they are
   - Keep code blocks, file paths, URLs, and technical terms unchanged (only translate descriptive text)
   - Ensure natural, fluent translation in the target language
   - The <documentation> section MUST contain the ACTUAL TRANSLATED TEXT, not the original
3. If it's an edit request (not translation):
   - Make the requested changes
   - Preserve structure and formatting
4. Return the complete updated documentation with ALL changes applied
5. Explain briefly what you changed

IMPORTANT: When translating, you MUST provide the actual translated content in the <documentation> section. Do not just copy the original text - translate it to the requested language.

Return your response in this format:
<explanation>
Brief explanation of what you changed (e.g., "Translated the entire documentation to French" or "Improved grammar and clarity in the introduction section")
</explanation>

<documentation>
[Complete updated documentation here - MUST be translated if translation was requested]
</documentation>`;

  try {
    // Check if this is a translation request
    const isTranslationRequest = request.toLowerCase().includes('translate') || 
                                 request.toLowerCase().includes('translation');
    
    // Use higher maxTokens for translations (they need more space)
    const maxTokens = isTranslationRequest ? 16384 : 4096;
    
    // Call LangChain without RAG (we're editing documentation, not analyzing code)
    const response = await callLangChain(
      prompt, 
      systemPrompt, 
      model, 
      0.7,
      undefined, // No repoName - we're not using RAG
      false, // Don't use RAG for documentation editing
      maxTokens // Higher limit for translations
    );
    
    // Extract explanation and documentation
    const explanationMatch = response.match(/<explanation>([\s\S]*?)<\/explanation>/);
    const docMatch = response.match(/<documentation>([\s\S]*?)<\/documentation>/);
    
    const explanation = explanationMatch ? explanationMatch[1].trim() : 'I\'ve updated your documentation.';
    let updatedDoc = docMatch ? docMatch[1].trim() : currentDocumentation;
    
    // If the response doesn't contain the documentation tags, try to extract it from the full response
    // Sometimes the AI might not follow the exact format
    if (!docMatch && response.length > 100) {
      // Check if the response might be the documentation itself
      const hasExplanation = explanationMatch !== null;
      if (!hasExplanation) {
        // If no explanation found, the whole response might be the documentation
        updatedDoc = response.trim();
      } else {
        // Try to find documentation after the explanation
        const afterExplanation = response.split('</explanation>')[1];
        if (afterExplanation) {
          updatedDoc = afterExplanation.replace(/<documentation>/g, '').replace(/<\/documentation>/g, '').trim();
        }
      }
    }
    
    // Fallback to original if we couldn't extract anything meaningful
    if (!updatedDoc || updatedDoc.length < 10) {
      updatedDoc = currentDocumentation;
    }

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