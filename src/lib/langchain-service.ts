import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
import { retrieveContext } from '../rag/index';

/**
 * Set OpenAI API key in localStorage
 */
export function setOpenAIApiKey(key: string): void {
  try {
    localStorage.setItem('openai_api_key', key);
    console.log('OpenAI API key stored successfully');
  } catch (e) {
    console.error('Failed to store OpenAI API key:', e);
    throw new Error('Could not store OpenAI API key in localStorage');
  }
}

/**
 * Get OpenAI API key from localStorage or environment
 */
export function getOpenAIApiKey(): string | null {
  // First try localStorage (for runtime config)
  try {
    const storedKey = localStorage.getItem('openai_api_key');
    if (storedKey) {
      return storedKey;
    }
  } catch (e) {
    console.warn('Could not access localStorage for OpenAI API key');
  }
  
  // Then try environment variable (for build-time config)
  const envKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (envKey) {
    return envKey;
  }
  
  return null;
}

// Get API key dynamically each time (in case env vars or localStorage change)
const getOpenAIApiKeyForUse = (): string => {
  const apiKey = getOpenAIApiKey();
  if (!apiKey) {
    throw new Error('OpenAI API key not configured. Please go to Settings and enter your API key.');
  }
  if (!apiKey.startsWith('sk-')) {
    console.warn('[LangChain] API key does not start with "sk-" - it may be invalid');
  }
  return apiKey;
};

// Initialize LangChain ChatOpenAI model
const getChatModel = (model: string = 'gpt-4o-mini', temperature: number = 0.7, maxTokens?: number) => {
  const apiKey = getOpenAIApiKeyForUse();

  // Log for debugging
  if (import.meta.env.DEV) {
    console.debug(`[LangChain] Model: ${model}, Temp: ${temperature}, MaxTokens: ${maxTokens || 'default'}`);
  }

  // In browser environment, patch fetch to route through Vite proxy to avoid CORS
  const isBrowser = typeof window !== 'undefined';
  if (isBrowser) {
    // Store original fetch if not already stored (to avoid multiple patches)
    if (!(window as any).__originalFetch) {
      (window as any).__originalFetch = window.fetch;
    }
    const originalFetch = (window as any).__originalFetch;
    
    // Patch fetch to intercept OpenAI API calls
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      
      // Skip interception for proxy URLs (to avoid recursion)
      if (url.startsWith('/api/openai')) {
        return originalFetch(input, init);
      }
      
      // Only intercept OpenAI chat completions API calls - NOT embeddings
      // Embeddings should go directly to their endpoint without interception
      const isOpenAICall = (url.includes('api.openai.com/v1/chat/completions') || 
                           url.includes('/api/openai/chat/completions')) && 
                           !url.includes('/embeddings'); // Explicitly exclude embeddings
      
      if (isOpenAICall) {
        try {
          // Parse the request body
          const body = init?.body ? JSON.parse(init.body as string) : {};
          
          // Route through Vite proxy (only works in dev mode)
          // In production, we need to call OpenAI directly (CORS must be handled server-side)
          const isDev = import.meta.env.DEV;
          const proxyUrl = isDev ? '/api/openai/chat/completions' : 'https://api.openai.com/v1/chat/completions';
          
          if (!apiKey) {
            throw new Error('OpenAI API key is not configured. Please set your API key in Settings.');
          }
          
          console.debug(`[LangChain] API call: ${body.model || model} (${body.messages?.length || 0} messages)`);
          
          // Prepare headers based on mode
          const headers: HeadersInit = {
            'Content-Type': 'application/json',
          };
          
          if (isDev) {
            // In dev, pass API key in custom header for proxy
            headers['x-api-key'] = apiKey;
          } else {
            // In production, use Authorization header directly
            headers['Authorization'] = `Bearer ${apiKey}`;
          }
          
          const proxyResponse = await originalFetch(proxyUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': apiKey, // Pass API key in custom header (from localStorage)
              ...headers, // Merge any additional headers
            },
            body: JSON.stringify({
              messages: body.messages || [],
              model: body.model || model,
              temperature: body.temperature || temperature,
              max_tokens: body.max_tokens || body.maxTokens || maxTokens || 4096,
            }),
          });

          if (!proxyResponse.ok) {
            let errorMessage = 'Request failed';
            let errorDetails: any = null;
            try {
              errorDetails = await proxyResponse.json();
              errorMessage = errorDetails.error?.message || errorDetails.error || errorDetails.message || errorMessage;
              
              // Log full error details for 403 to help diagnose
              if (proxyResponse.status === 403) {
                console.error('[LangChain] 403 Forbidden - Full error details:', {
                  status: proxyResponse.status,
                  error: errorDetails,
                  errorType: errorDetails.error?.type,
                  errorCode: errorDetails.error?.code,
                  errorParam: errorDetails.error?.param,
                  apiKeyPrefix: apiKey ? `${apiKey.substring(0, 10)}...` : 'MISSING',
                  endpoint: proxyUrl,
                });
              }
            } catch (e) {
              const errorText = await proxyResponse.text();
              errorMessage = errorText || errorMessage;
            }
            
            console.error('[LangChain] Request error:', {
              status: proxyResponse.status,
              statusText: proxyResponse.statusText,
              url: proxyUrl,
              mode: isDev ? 'dev (proxy)' : 'production (direct)',
              error: errorDetails || errorMessage,
              apiKeyPresent: !!apiKey,
              apiKeyPrefix: apiKey ? `${apiKey.substring(0, 10)}...` : 'MISSING',
            });
            
            if (proxyResponse.status === 404) {
              if (isDev) {
                throw new Error('Proxy endpoint not found (404). Make sure the Vite dev server is running and the proxy is configured correctly.');
              } else {
                throw new Error('OpenAI API endpoint not found (404). This may be a CORS issue. Consider using a backend proxy in production.');
              }
            }
            
            if (proxyResponse.status === 401) {
              throw new Error('OpenAI API key is missing or invalid. Please check your API key in Settings.');
            }
            
            if (proxyResponse.status === 403) {
              const detailedMessage = errorDetails?.error?.message || errorMessage;
              throw new Error(`Access forbidden (403): ${detailedMessage}. Please check: 1) Your API key is valid and active, 2) Your account has access to embeddings API, 3) Your account has sufficient credits/quota.`);
            }
            
            // Check for invalid model errors (400 status with model-related error)
            if (proxyResponse.status === 400) {
              if (errorMessage.includes('model') || errorMessage.includes('invalid') || errorDetails?.error?.code === 'invalid_model') {
                const modelName = body.model || model;
                throw new Error(`Invalid model "${modelName}". This model does not exist or is not available. Please select a valid model like gpt-4o-mini, gpt-4o, gpt-4-turbo, gpt-4, or gpt-3.5-turbo.`);
              }
            }
            
            throw new Error(`Request failed: ${errorMessage} (${proxyResponse.status})`);
          }

          // Return the response in OpenAI format
          return proxyResponse;
        } catch (error) {
          console.error('[LangChain] Proxy request failed:', error);
          throw error;
        }
      }
      
      // For all other requests, use original fetch
      return originalFetch(input, init);
    };
  }

  // In @langchain/openai v1.x, pass apiKey directly
  const config: any = {
    modelName: model,
    temperature,
    apiKey: apiKey,
  };
  
  // Set maxTokens if provided (for longer documentation generation)
  // LangChain ChatOpenAI uses 'maxTokens' property
  if (maxTokens) {
    config.maxTokens = maxTokens;
    // Also set max_tokens as fallback (some versions might use this)
    config.max_tokens = maxTokens;
  }
  
  return new ChatOpenAI(config);
};

// Create a chain for structured JSON output
export async function callLangChain(
  prompt: string,
  systemPrompt?: string,
  model: string = 'gpt-4o-mini',
  temperature: number = 0.7,
  repoName?: string,
  useRAG: boolean = true,
  maxTokens?: number
): Promise<string> {
  // Set high maxTokens for documentation generation (16k tokens ≈ 12k words)
  // For GPT-4o models, max output is 16,384 tokens
  const defaultMaxTokens = maxTokens || (model.includes('gpt-4o') ? 16384 : 4096);
  const chatModel = getChatModel(model, temperature, defaultMaxTokens);
  const outputParser = new StringOutputParser();

  // Retrieve RAG context if enabled
  // Check if RAG context is already in the prompt (from DocsWriter)
  const hasRAGInPrompt = prompt.includes('Relevant Code Context:') || prompt.includes('RAG context') || prompt.includes('ACTUAL CODE FROM REPOSITORY');
  let ragContext = '';
  if (useRAG && repoName && !hasRAGInPrompt) {
    try {
      // Increase chunks for more comprehensive context (matching DocsWriter's 10 chunks)
      const rawContext = await retrieveContext(prompt, repoName, 10);
      if (rawContext) {
        ragContext = `\n\nRelevant code context:\n${rawContext}\n`;
      }
    } catch (error) {
      console.warn('[LangChain] RAG retrieval failed, continuing without context:', error);
    }
  } else if (useRAG && repoName && hasRAGInPrompt) {
    // RAG context already in prompt, skip retrieval to avoid duplication
    console.debug('[LangChain] RAG context already in prompt, skipping retrieval');
  }
  
  const messages = [];
  if (systemPrompt) {
    messages.push(new SystemMessage(systemPrompt));
  }
  
  // Add RAG context to the prompt if available and not already included
  const enhancedPrompt = ragContext && !hasRAGInPrompt
    ? `${ragContext}\n\nUser query: ${prompt}`
    : prompt;
  
  messages.push(new HumanMessage(enhancedPrompt));

  const chain = RunnableSequence.from([chatModel, outputParser]);

  try {
    const response = await chain.invoke(messages);
    
    // Log response length for debugging
    const responseWordCount = typeof response === 'string' ? response.split(/\s+/).length : 0;
    console.debug(`[LangChain] Response: ${responseWordCount} words (maxTokens: ${defaultMaxTokens})`);
    
    // Only warn if response is extremely short AND we're expecting a long response
    // Suppress warnings for planning/analysis tasks that naturally produce short responses
    // Only show warnings for documentation generation that truly failed (extremely short responses)
    if (responseWordCount < 100 && defaultMaxTokens >= 15000) {
      // Only warn for extremely short responses (< 100 words) with very high maxTokens (>= 15000)
      // This typically indicates documentation generation that completely failed
      // Planning/analysis tasks (130-300 words) are acceptable and won't trigger warnings
      console.warn(`[LangChain] ⚠️ WARNING: Response is extremely short (${responseWordCount} words) despite high maxTokens (${defaultMaxTokens}).`);
      console.warn(`[LangChain] Possible causes:`);
      console.warn(`[LangChain] 1. Model may have stopped early (hit a stop sequence or finish token)`);
      console.warn(`[LangChain] 2. RAG context may be empty, causing model to have insufficient information`);
      console.warn(`[LangChain] 3. Prompt may not be providing enough guidance for comprehensive output`);
      console.warn(`[LangChain] 4. Model may be hitting rate limits or other API constraints`);
    } else if (responseWordCount < 200 && defaultMaxTokens >= 15000) {
      // Debug-level logging for short responses in high-token contexts
      // This is expected for planning/analysis tasks (130-300 words is normal)
      console.debug(`[LangChain] Response is short (${responseWordCount} words) with high maxTokens (${defaultMaxTokens}). This is expected for planning/analysis tasks.`);
    }
    
    return response;
  } catch (error: any) {
    console.error('[LangChain] Error in callLangChain:', error);
    
    // Provide more helpful error messages
    let errorMessage = error.message || 'Unknown error';
    
    if (errorMessage.includes('Invalid model') || errorMessage.includes('invalid_model') || errorMessage.includes('does not exist')) {
      // Model error - already has a helpful message, just rethrow
      throw error;
    } else if (errorMessage.includes('API key') || errorMessage.includes('401')) {
      errorMessage = 'OpenAI API key is missing or invalid. Please configure your API key in settings.';
    } else if (errorMessage.includes('CORS') || errorMessage.includes('cors')) {
      errorMessage = 'CORS error. Make sure your OpenAI API key is configured correctly.';
    } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      errorMessage = 'Network error. Please check your internet connection and try again.';
    } else if (errorMessage.includes('timeout')) {
      errorMessage = 'Request timed out. Please try again.';
    }
    
    throw new Error(errorMessage);
  }
}

// Create a chain for JSON output with structured parsing
export async function callLangChainJSON<T = any>(
  prompt: string,
  systemPrompt?: string,
  model: string = 'gpt-4o-mini',
  temperature: number = 0.7,
  repoName?: string,
  useRAG: boolean = true,
  maxTokens?: number
): Promise<T> {
  const response = await callLangChain(prompt, systemPrompt, model, temperature, repoName, useRAG, maxTokens);
  
  try {
    return JSON.parse(response);
  } catch {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/```\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    throw new Error('Could not parse JSON from LangChain response');
  }
}

// Create a chain with retry logic
export async function callLangChainWithRetry(
  prompt: string,
  systemPrompt?: string,
  model: string = 'gpt-4o-mini',
  temperature: number = 0.7,
  maxRetries: number = 3
): Promise<string> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await callLangChain(prompt, systemPrompt, model, temperature);
    } catch (error: any) {
      lastError = error;
      if (attempt < maxRetries) {
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }
  
  throw lastError || new Error('Failed after retries');
}

