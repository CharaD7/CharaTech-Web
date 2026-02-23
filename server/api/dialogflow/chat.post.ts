export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { message, sessionId } = body

  if (!message) {
    throw createError({
      statusCode: 400,
      message: 'Message is required',
    })
  }

  const result = await detectIntent(sessionId || createDialogflowSession(), message)

  if (!result.success) {
    throw createError({
      statusCode: 500,
      message: 'Dialogflow error',
    })
  }

  return {
    response: result.response?.fulfillmentText || '',
    intent: result.response?.intent?.displayName,
    parameters: result.response?.parameters,
    sessionId,
  }
})
