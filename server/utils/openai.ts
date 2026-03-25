import OpenAI from 'openai'

let openaiClient: OpenAI | null = null

export const getOpenAIClient = () => {
  if (openaiClient) return openaiClient

  const config = useRuntimeConfig()
  const apiKey = config.openaiApiKey as string

  if (!apiKey) {
    throw new Error('OpenAI API key not configured')
  }

  openaiClient = new OpenAI({ apiKey })
  return openaiClient
}

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
    const client = getOpenAIClient()

    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory,
      { role: 'user', content: message },
    ]

    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: 500,
      temperature: 0.7,
    })

    const response = completion.choices[0]?.message?.content

    return {
      success: true,
      response: response || '',
    }
  } catch (error: any) {
    console.error('OpenAI error:', error)
    return {
      success: false,
      error: error.message || 'OpenAI API error',
    }
  }
}

export const generateRequirementsAnalysis = async (
  requirements: Record<string, any>
): Promise<{ success: boolean; analysis?: string; suggestions?: string[] }> => {
  try {
    const client = getOpenAIClient()

    const prompt = `Analyze these software requirements and provide feedback:

${JSON.stringify(requirements, null, 2)}

Provide:
1. A brief summary of what you've understood
2. Any gaps or ambiguities that need clarification
3. Suggestions for additional features that are commonly expected for this type of project
4. Potential technical considerations

Keep the response structured and actionable.`

    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a software requirements expert. Provide clear, actionable feedback.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 800,
      temperature: 0.5,
    })

    const response = completion.choices[0]?.message?.content || undefined

    return {
      success: true,
      analysis: response,
    }
  } catch (error: any) {
    console.error('OpenAI analysis error:', error)
    return {
      success: false,
    }
  }
}

export const estimateProject = async (
  industry: string,
  projectType: string[],
  complexity: string,
  budget?: string
): Promise<{ success: boolean; estimate?: string; timeline?: string }> => {
  try {
    const client = getOpenAIClient()

    const prompt = `Provide a rough estimate for a ${complexity.toLowerCase()} ${projectType.join(', ')} project in the ${industry.toLowerCase()} industry${budget ? ` with a budget of ${budget}` : ''}.

Give:
1. Estimated development time range (in weeks)
2. Recommended team size
3. Key phases of development
4. Any cost-saving tips

Be realistic and helpful.`

    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a software project estimation expert. Provide realistic estimates based on industry standards.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 600,
      temperature: 0.3,
    })

    const response = completion.choices[0]?.message?.content || undefined

    return {
      success: true,
      estimate: response,
    }
  } catch (error: any) {
    console.error('OpenAI estimate error:', error)
    return {
      success: false,
    }
  }
}
