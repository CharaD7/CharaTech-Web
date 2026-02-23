import twilio from 'twilio'

let twilioClient: ReturnType<typeof twilio> | null = null

export const getTwilioClient = () => {
  if (twilioClient) return twilioClient

  const config = useRuntimeConfig()

  twilioClient = twilio(
    config.twilioAccountSid as string,
    config.twilioAuthToken as string
  )

  return twilioClient
}

export const sendSMS = async (to: string, message: string) => {
  try {
    const config = useRuntimeConfig()
    const client = getTwilioClient()

    await client.messages.create({
      body: message,
      from: config.twilioPhoneNumber as string,
      to,
    })

    return { success: true }
  } catch (error) {
    console.error('SMS send error:', error)
    return { success: false, error }
  }
}
