import { defineEventHandler, readBody, createError } from 'h3'

const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'https://api.ollama.com/v1/chat/completions'
const MODEL = process.env.OLLAMA_MODEL || 'llama-3.2-90b-vision-preview'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatCompletionResult {
  success: boolean
  response?: string
  error?: string
}

const SYSTEM_PROMPT = `You are Chara, an AI assistant for CharaTech - a software requirements gathering platform.

Your role is to help clients articulate their software project requirements through friendly, conversational guidance.

Guidelines:
- Ask clarifying questions about project goals, target users, and must-have features
- Suggest relevant technologies when appropriate (but let the client decide)
- Be concise but thorough - avoid jargon
- If requirements are vague, gently prompt for more detail
- Keep responses under 3 sentences unless detailed explanation is needed
- You can ask about: industry, project type (web app, mobile, etc.), budget range, timeline, key features, integrations needed

Start by greeting the user warmly and asking what kind of software project they're looking to build.`

export const chatWithAI = async (
  message: string,
  conversationHistory: ChatMessage[] = []
): Promise<ChatCompletionResult> => {
  try {
    const config = useRuntimeConfig()
    const apiKey = config.ollamaApiKey as string

    if (!apiKey) {
      console.error('Ollama API key not configured - please set OLLAMA_API_KEY environment variable')
      throw new Error('AI service not configured. Please contact support.')
    }

    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory,
      { role: 'user', content: message },
    ]

    console.log('Calling Ollama API with model:', MODEL)
    console.log('API URL:', OLLAMA_API_URL)

    const response = await fetch(OLLAMA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        stream: false,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Ollama API error:', response.status, errorText)
      const errorData = JSON.parse(errorText || '{}')
      throw new Error(errorData.error?.message || `Ollama API error: ${response.status}`)
    }

    const data = await response.json()
    console.log('Ollama response:', data)
    const content = data.choices?.[0]?.message?.content || ''

    return {
      success: true,
      response: content,
    }
  } catch (error: any) {
    console.error('Ollama error:', error)
    return {
      success: false,
      error: error.message || 'AI service error. Please try again.',
    }
  }
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { message, conversationHistory } = body

  if (!message) {
    throw createError({
      statusCode: 400,
      message: 'Message is required',
    })
  }

  const history: ChatMessage[] = conversationHistory || []
  const result = await chatWithAI(message, history)

  if (!result.success) {
    throw createError({
      statusCode: 500,
      message: result.error || 'AI service error. Please try again.',
    })
  }

  return {
    response: result.response || '',
  }
})
