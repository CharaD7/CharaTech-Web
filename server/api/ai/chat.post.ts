import { H3Event } from 'h3'

interface ChatRequest {
  messages: Array<{
    role: 'system' | 'user' | 'assistant'
    content: string
  }>
  model?: string
  stream?: boolean
}

export default defineEventHandler(async (event: H3Event) => {
  try {
    const body = await readBody<ChatRequest>(event)
    
    const response = await $fetch('https://api.ollama.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OLLAMA_API_KEY}`,
      },
      body: {
        model: body.model || 'llama-3.2-90b-vision-preview',
        messages: body.messages,
        stream: body.stream || false,
      },
    })

    return response
  } catch (error: any) {
    console.error('AI API Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'AI service temporarily unavailable',
      data: { originalError: error.message }
    })
  }
})