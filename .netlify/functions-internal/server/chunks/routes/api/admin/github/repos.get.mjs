import { d as defineEventHandler, r as requireAdmin, a as getQuery, G as GITHUB_OWNER, l as listUserRepos } from '../../../../_/nitro.mjs';
import '@supabase/supabase-js';
import '@prisma/client';
import '@prisma/adapter-pg';
import 'pg';
import '@google-cloud/dialogflow';
import 'uuid';
import 'nodemailer';
import 'twilio';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import '@iconify/utils';
import 'node:crypto';
import 'consola';
import 'node:url';
import 'ipx';
import 'node:fs';
import 'node:path';

const repos_get = defineEventHandler(async (event) => {
  await requireAdmin(event);
  const query = getQuery(event);
  const username = query.username || GITHUB_OWNER;
  const search = (query.search || "").toLowerCase();
  const repos = await listUserRepos(username);
  const filtered = search ? repos.filter(
    (r) => {
      var _a, _b;
      return r.name.toLowerCase().includes(search) || ((_a = r.description) == null ? void 0 : _a.toLowerCase().includes(search)) || ((_b = r.topics) == null ? void 0 : _b.some((t) => t.toLowerCase().includes(search)));
    }
  ) : repos;
  return filtered.map((r) => {
    var _a;
    return {
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
      topics: (_a = r.topics) != null ? _a : []
    };
  });
});

export { repos_get as default };
//# sourceMappingURL=repos.get.mjs.map
