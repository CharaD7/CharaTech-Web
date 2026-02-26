import { SessionsClient } from '@google-cloud/dialogflow'
import { v4 as uuidv4 } from 'uuid'
import { readFileSync } from 'node:fs'

let sessionClient: SessionsClient | null = null

export const getDialogflowClient = () => {
  if (sessionClient) return sessionClient

  const config = useRuntimeConfig()
  
  const dialogflowCredentialsPath = config.dialogflowCredentials as string | undefined
  let credentials
  if (dialogflowCredentialsPath) {
    try {
      const credentialsFileContent = readFileSync(dialogflowCredentialsPath, 'utf-8')
      credentials = JSON.parse(credentialsFileContent)
    } catch (fileError) {
      console.error('Failed to read Dialogflow credentials file:', fileError)
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
