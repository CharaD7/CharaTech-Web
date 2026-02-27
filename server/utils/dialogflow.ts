import { SessionsClient } from '@google-cloud/dialogflow'
import { v4 as uuidv4 } from 'uuid'
// import { readFileSync } from 'node:fs' // Removed as we're now using Base64

let sessionClient: SessionsClient | null = null

export const getDialogflowClient = () => {
  if (sessionClient) return sessionClient

  const config = useRuntimeConfig()
  
  const dialogflowCredentialsBase64 = config.dialogflowCredentialsBase64 as string | undefined
  let credentials
  if (dialogflowCredentialsBase64) {
    try {
      const credentialsFileContent = Buffer.from(dialogflowCredentialsBase64, 'base64').toString('utf-8')
      credentials = JSON.parse(credentialsFileContent)
    } catch (decodeError) {
      console.error('Failed to decode or parse Dialogflow credentials (Base64):', decodeError)
    }
  }

  sessionClient = new SessionsClient({
    credentials,
  })

  return sessionClient
}

export const detectIntent = async (
  sessionId: string,
  query: string,
  languageCode = 'en'
) => {
  try {
    const config = useRuntimeConfig()
    const sessionClient = getDialogflowClient()
    const projectId = config.dialogflowProjectId as string

    const sessionPath = sessionClient.projectAgentSessionPath(
      projectId,
      sessionId
    )

    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: query,
          languageCode,
        },
      },
    }

    const [response] = await sessionClient.detectIntent(request)
    
    return {
      success: true,
      response: response.queryResult,
    }
  } catch (error) {
    console.error('Dialogflow error:', error)
    return {
      success: false,
      error,
    }
  }
}

export const createDialogflowSession = () => {
  return uuidv4()
}
