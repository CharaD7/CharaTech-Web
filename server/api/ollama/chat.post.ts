import { chatWithAI } from '~~/server/utils/openai'
import type { ChatMessage } from '~~/server/utils/openai'

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
