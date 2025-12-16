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
    throw new Error('OpenAI API key not configured. ');
  }
  return apiKey;
};

// Initialize LangChain ChatOpenAI model
const getChatModel = (model: string = 'gpt-4o-mini', temperature: number = 0.7) => {
  const apiKey = getOpenAIApiKeyForUse();

  // Log for debugging (remove in production)
  if (typeof window !== 'undefined' && import.meta.env.DEV) {
    console.log('LangChain: Using API key from VITE_OPENAI_API_KEY:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT FOUND');
  }

  // In @langchain/openai v1.x, pass apiKey directly
  // The error message suggests using 'apiKey' parameter
  return new ChatOpenAI({
    modelName: model,
    temperature,
    apiKey: apiKey, // Use 'apiKey' as suggested by the error message
  });
};

// Create a chain for structured JSON output
export async function callLangChain(
  prompt: string,
  systemPrompt?: string,
  model: string = 'gpt-4o-mini',
  temperature: number = 0.7,
  repoName?: string,
  useRAG: boolean = true
): Promise<string> {
  const chatModel = getChatModel(model, temperature);
  const outputParser = new StringOutputParser();

  // Retrieve RAG context if enabled
  let ragContext = '';
  if (useRAG && repoName) {
    try {
      ragContext = await retrieveContext(prompt, repoName, 5);
    } catch (error) {
      console.warn('[LangChain] RAG retrieval failed, continuing without context:', error);
    }
  }

  const messages = [];
  if (systemPrompt) {
    messages.push(new SystemMessage(systemPrompt));
  }
  
  // Add RAG context to the prompt if available
  const enhancedPrompt = ragContext 
    ? `${ragContext}\n\nUser query: ${prompt}`
    : prompt;
  
  messages.push(new HumanMessage(enhancedPrompt));

  const chain = RunnableSequence.from([chatModel, outputParser]);

  try {
    const response = await chain.invoke(messages);
    return response;
  } catch (error: any) {
    throw new Error(`LangChain error: ${error.message || 'Unknown error'}`);
  }
}

// Create a chain for JSON output with structured parsing
export async function callLangChainJSON<T = any>(
  prompt: string,
  systemPrompt?: string,
  model: string = 'gpt-4o-mini',
  temperature: number = 0.7,
  repoName?: string,
  useRAG: boolean = true
): Promise<T> {
  const response = await callLangChain(prompt, systemPrompt, model, temperature, repoName, useRAG);
  
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

