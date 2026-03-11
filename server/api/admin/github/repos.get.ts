// GET /api/admin/github/repos — list CharaD7's public repos for repo-linking UI
export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const query = getQuery(event)
  const username = (query.username as string) || GITHUB_OWNER
  const search = ((query.search as string) || '').toLowerCase()

  const repos = await listUserRepos(username)

  // Filter by search term if provided
  const filtered = search
    ? repos.filter(r =>
        r.name.toLowerCase().includes(search) ||
        r.description?.toLowerCase().includes(search) ||
        r.topics?.some(t => t.toLowerCase().includes(search))
      )
    : repos

  return filtered.map(r => ({
    id: r.id,
    name: r.name,
    fullName: r.full_name,
    description: r.description,
    language: r.language,
    stars: r.stargazers_count,
    forks: r.forks_count,
    updatedAt: r.updated_at,
    pushedAt: r.pushed_at,
    htmlUrl: r.html_url,
    topics: r.topics ?? [],
  }))
})
