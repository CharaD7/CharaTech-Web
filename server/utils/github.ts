/**
 * GitHub API utility — all calls go through here.
 * Set GITHUB_TOKEN (personal access token with repo scope) for authenticated
 * requests (5000 req/hr vs 60 req/hr for anonymous).
 * Set GITHUB_OWNER to your GitHub username (defaults to 'CharaD7').
 */

const GITHUB_API = 'https://api.github.com'

export const GITHUB_OWNER = process.env.GITHUB_OWNER || 'CharaD7'

function githubHeaders() {
  const token = process.env.GITHUB_TOKEN
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'CharaTech-Web/1.0',
  }
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

async function ghFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${GITHUB_API}${path}`, { headers: githubHeaders() })
  if (!res.ok) {
    const body = await res.text().catch(() => res.statusText)
    throw createError({ statusCode: res.status, message: `GitHub API: ${body}` })
  }
  return res.json() as Promise<T>
}

/** Returns null if GitHub is still computing stats (202 status) — retry after a few seconds */
async function ghStatsFetch<T>(path: string): Promise<T | null> {
  const res = await fetch(`${GITHUB_API}${path}`, { headers: githubHeaders() })
  if (res.status === 202) return null // Still computing, caller should retry
  if (!res.ok) return null
  return res.json() as Promise<T>
}

// ─── Repository ────────────────────────────────────────────────────────────

/** List all public repos for a user, sorted by last update */
export async function listUserRepos(username: string = GITHUB_OWNER) {
  return ghFetch<GitHubRepo[]>(
    `/users/${username}/repos?sort=updated&per_page=100&type=public`
  )
}

/** Full repository metadata */
export async function getRepoInfo(repo: string) {
  const [owner, name] = repo.split('/')
  return ghFetch<GitHubRepo>(`/repos/${owner}/${name}`)
}

/** Language breakdown in bytes */
export async function getRepoLanguages(repo: string) {
  const [owner, name] = repo.split('/')
  return ghFetch<Record<string, number>>(`/repos/${owner}/${name}/languages`)
}

// ─── Commits ───────────────────────────────────────────────────────────────

/**
 * 52 weeks of commit activity.
 * Each entry: { week: unixTimestamp, days: [sun..sat counts], total: number }
 * Returns null if GitHub hasn't computed the cache yet (202 response).
 */
export async function getCommitActivity(repo: string) {
  const [owner, name] = repo.split('/')
  return ghStatsFetch<CommitWeek[]>(`/repos/${owner}/${name}/stats/commit_activity`)
}

/**
 * Weekly code frequency: [timestamp, additions, deletions] tuples.
 * Returns null if still computing.
 */
export async function getCodeFrequency(repo: string) {
  const [owner, name] = repo.split('/')
  return ghStatsFetch<[number, number, number][]>(`/repos/${owner}/${name}/stats/code_frequency`)
}

/** Recent commits on the default branch */
export async function getRecentCommits(repo: string, perPage = 20) {
  const [owner, name] = repo.split('/')
  return ghFetch<GitHubCommit[]>(
    `/repos/${owner}/${name}/commits?per_page=${perPage}`
  )
}

/** Per-contributor commit totals and weekly breakdown. Returns null if computing. */
export async function getContributors(repo: string) {
  const [owner, name] = repo.split('/')
  return ghStatsFetch<GitHubContributor[]>(`/repos/${owner}/${name}/stats/contributors`)
}

// ─── Issues & Milestones ───────────────────────────────────────────────────

/** All milestones (open + closed) */
export async function getRepoMilestones(repo: string) {
  const [owner, name] = repo.split('/')
  return ghFetch<GitHubMilestone[]>(
    `/repos/${owner}/${name}/milestones?state=all&per_page=100`
  )
}

/** Issues for the whole repo or filtered by milestone number */
export async function getRepoIssues(
  repo: string,
  state: 'open' | 'closed' | 'all' = 'all',
  milestoneNumber?: number
) {
  const [owner, name] = repo.split('/')
  const ms = milestoneNumber ? `&milestone=${milestoneNumber}` : ''
  return ghFetch<GitHubIssue[]>(
    `/repos/${owner}/${name}/issues?state=${state}&per_page=100${ms}`
  )
}

// ─── Pull Requests ─────────────────────────────────────────────────────────

export async function getPullRequests(repo: string, state: 'open' | 'closed' | 'all' = 'all') {
  const [owner, name] = repo.split('/')
  return ghFetch<GitHubPR[]>(
    `/repos/${owner}/${name}/pulls?state=${state}&per_page=100`
  )
}

// ─── Releases ──────────────────────────────────────────────────────────────

export async function getRecentReleases(repo: string, perPage = 10) {
  const [owner, name] = repo.split('/')
  return ghFetch<GitHubRelease[]>(`/repos/${owner}/${name}/releases?per_page=${perPage}`)
}

// ─── Progress Calculation ─────────────────────────────────────────────────

/**
 * Calculates overall project completion percentage.
 * Priority: GitHub milestones → open/closed issue ratio → PR merge ratio.
 */
export function calculateGitHubProgress(
  milestones: GitHubMilestone[],
  repoInfo?: GitHubRepo,
  prs?: GitHubPR[]
): number {
  if (milestones && milestones.length > 0) {
    const totalClosed = milestones.reduce((s, m) => s + m.closed_issues, 0)
    const totalAll = milestones.reduce((s, m) => s + m.open_issues + m.closed_issues, 0)
    if (totalAll > 0) return Math.round((totalClosed / totalAll) * 100)
  }

  if (prs && prs.length > 0) {
    const merged = prs.filter(pr => pr.merged_at).length
    if (prs.length > 0) return Math.round((merged / prs.length) * 100)
  }

  if (repoInfo) {
    // Rough heuristic: open issues → work remaining
    const total = repoInfo.open_issues_count + (repoInfo as any).closed_issues_count || repoInfo.open_issues_count
    if (total > 0) return Math.round(((total - repoInfo.open_issues_count) / total) * 100)
  }

  return 0
}

/**
 * Fuzzy-match a project name against a list of repos.
 * Returns the best matching repo slug or null.
 */
export function findBestMatchingRepo(projectName: string, repos: GitHubRepo[]): GitHubRepo | null {
  const normalise = (s: string) => s.toLowerCase().replace(/[\s_-]+/g, '')
  const needle = normalise(projectName)
  let best: GitHubRepo | null = null
  let bestScore = 0

  for (const repo of repos) {
    const haystack = normalise(repo.name)
    // Exact match
    if (haystack === needle) return repo
    // Contains match
    if (haystack.includes(needle) || needle.includes(haystack)) {
      const score = Math.min(haystack.length, needle.length) / Math.max(haystack.length, needle.length)
      if (score > bestScore) { bestScore = score; best = repo }
    }
    // Check topics
    if (repo.topics?.some(t => normalise(t).includes(needle))) {
      if (0.5 > bestScore) { bestScore = 0.5; best = repo }
    }
  }

  return bestScore > 0.3 ? best : null
}

// ─── Types ────────────────────────────────────────────────────────────────

export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  clone_url: string
  language: string | null
  stargazers_count: number
  forks_count: number
  open_issues_count: number
  default_branch: string
  created_at: string
  updated_at: string
  pushed_at: string
  size: number
  topics?: string[]
  private: boolean
  visibility: string
}

export interface CommitWeek {
  week: number   // Unix timestamp of Sunday
  days: number[] // [sun, mon, tue, wed, thu, fri, sat]
  total: number
}

export interface GitHubCommit {
  sha: string
  html_url: string
  commit: {
    message: string
    author: { name: string; email: string; date: string }
  }
  author: { login: string; avatar_url: string; html_url: string } | null
}

export interface GitHubMilestone {
  number: number
  title: string
  description: string | null
  state: 'open' | 'closed'
  open_issues: number
  closed_issues: number
  due_on: string | null
  created_at: string
  closed_at: string | null
  html_url: string
}

export interface GitHubIssue {
  number: number
  title: string
  state: 'open' | 'closed'
  html_url: string
  created_at: string
  closed_at: string | null
  labels: { name: string; color: string }[]
}

export interface GitHubPR {
  number: number
  title: string
  state: 'open' | 'closed'
  merged_at: string | null
  html_url: string
  created_at: string
  user: { login: string; avatar_url: string }
}

export interface GitHubRelease {
  id: number
  tag_name: string
  name: string | null
  body: string | null
  published_at: string
  html_url: string
  prerelease: boolean
  draft: boolean
}

export interface GitHubContributor {
  author: { login: string; avatar_url: string; html_url: string }
  total: number
  weeks: { w: number; a: number; d: number; c: number }[]
}
