import { useRuntimeConfig } from '#imports'

interface LinearTeam {
  id: string
  name: string
  key: string
}

interface LinearUser {
  id: string
  name: string
  email: string
  avatarUrl?: string
}

interface LinearIssue {
  id: string
  identifier: string
  number: number
  title: string
  description?: string
  state: string
  priority: number
  assignee?: LinearUser
  dueDate?: string
  url: string
  createdAt: string
  updatedAt: string
}

interface LinearCreateIssueInput {
  title: string
  description?: string
  teamId: string
  priority?: number
  stateId?: string
  assigneeId?: string
  dueDate?: string
}

const LINEAR_API_URL = 'https://api.linear.app/graphql'

async function linearQuery(query: string, variables?: Record<string, any>) {
  const config = useRuntimeConfig()
  const apiKey = process.env.LINEAR_API_KEY

  if (!apiKey) {
    throw createError({
      statusCode: 500,
      message: 'Linear API key not configured'
    })
  }

  const response = await fetch(LINEAR_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: apiKey,
    },
    body: JSON.stringify({ query, variables })
  })

  if (!response.ok) {
    throw createError({
      statusCode: response.status,
      message: `Linear API error: ${response.statusText}`
    })
  }

  const data = await response.json()
  
  if (data.errors) {
    throw createError({
      statusCode: 400,
      message: `Linear GraphQL error: ${data.errors[0]?.message}`
    })
  }

  return data.data
}

export async function getLinearTeams(): Promise<LinearTeam[]> {
  const data = await linearQuery(`
    query {
      teams {
        nodes {
          id
          name
          key
        }
      }
    }
  `)
  return data.teams.nodes
}

export async function getLinearUsers(teamId?: string): Promise<LinearUser[]> {
  const query = teamId 
    ? `query($teamId: String!) {
        team(id: $teamId) {
          members {
            nodes {
              id
              name
              email
              avatarUrl
            }
          }
        }
      }`
    : `query {
        users {
          nodes {
            id
            name
            email
            avatarUrl
          }
        }
      }`

  const data = await linearQuery(query, teamId ? { teamId } : undefined)
  const key = teamId ? 'team.members.nodes' : 'users.nodes'
  return key.split('.').reduce((obj: any, k) => obj[k], data)
}

export async function getLinearIssues(teamId: string, options?: {
  state?: string
  assigneeId?: string
  first?: number
}): Promise<LinearIssue[]> {
  const data = await linearQuery(`
    query($teamId: String!, $filter: IssueFilter) {
      team(id: $teamId) {
        issues(filter: $filter, first: $first) {
          nodes {
            id
            identifier
            number
            title
            description
            state {
              name
            }
            priority
            assignee {
              id
              name
              email
              avatarUrl
            }
            dueDate
            url
            createdAt
            updatedAt
          }
        }
      }
    }
  `, {
    teamId,
    filter: options || {},
    first: options?.first || 50
  })
  
  return data.team.issues.nodes.map((issue: any) => ({
    ...issue,
    state: issue.state?.name
  }))
}

export async function createLinearIssue(input: LinearCreateIssueInput): Promise<LinearIssue> {
  const data = await linearQuery(`
    mutation($input: IssueCreateInput!) {
      issueCreate(input: $input) {
        success
        issue {
          id
          identifier
          number
          title
          description
          state {
            name
          }
          priority
          url
          createdAt
          updatedAt
        }
      }
    }
  `, { input })

  if (!data.issueCreate.success) {
    throw createError({
      statusCode: 400,
      message: 'Failed to create Linear issue'
    })
  }

  return {
    ...data.issueCreate.issue,
    state: data.issueCreate.issue.state?.name
  }
}

export async function updateLinearIssue(issueId: string, input: Partial<LinearCreateIssueInput>): Promise<LinearIssue> {
  const data = await linearQuery(`
    mutation($issueId: String!, $input: IssueUpdateInput!) {
      issueUpdate(id: $issueId, input: $input) {
        success
        issue {
          id
          identifier
          number
          title
          description
          state {
            name
          }
          priority
          url
          updatedAt
        }
      }
    }
  `, { issueId, input })

  if (!data.issueUpdate.success) {
    throw createError({
      statusCode: 400,
      message: 'Failed to update Linear issue'
    })
  }

  return {
    ...data.issueUpdate.issue,
    state: data.issueUpdate.issue.state?.name
  }
}

export async function syncSubmissionToLinear(submission: {
  projectName: string
  requirements: any
  additionalNotes?: string
}, teamId: string): Promise<LinearIssue[]> {
  const issues: LinearIssue[] = []
  
  const mainIssue = await createLinearIssue({
    title: `[${submission.projectName}] Project Requirements`,
    description: `## Requirements\n\n${JSON.stringify(submission.requirements, null, 2)}\n\n## Additional Notes\n\n${submission.additionalNotes || 'N/A'}`,
    teamId,
    priority: 3
  })
  issues.push(mainIssue)

  if (submission.requirements && typeof submission.requirements === 'object') {
    for (const [category, items] of Object.entries(submission.requirements as Record<string, any>)) {
      if (Array.isArray(items)) {
        const subIssue = await createLinearIssue({
          title: `[${submission.projectName}] ${category} Requirements`,
          description: items.map((item: any) => `- ${item.label || item}`).join('\n'),
          teamId,
          priority: 3
        })
        issues.push(subIssue)
      }
    }
  }

  return issues
}
