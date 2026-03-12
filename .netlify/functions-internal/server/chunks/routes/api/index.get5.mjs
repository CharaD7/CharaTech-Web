import { d as defineEventHandler, v as verifyToken, c as createError, p as prisma, k as getRepoInfo, z as getRepoMilestones, B as getRecentCommits, F as calculateGitHubProgress } from '../../_/nitro.mjs';
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

const index_get = defineEventHandler(async (event) => {
  const user = await verifyToken(event);
  if (!user) throw createError({ statusCode: 401, message: "Unauthorized" });
  const submissions = await prisma.submission.findMany({
    where: { userId: user.id },
    select: { id: true, projectName: true }
  });
  if (!submissions.length) return [];
  const timelines = await prisma.projectTimeline.findMany({
    where: { submissionId: { in: submissions.map((s) => s.id) } },
    include: { milestones: { orderBy: { order: "asc" } } },
    orderBy: { createdAt: "desc" }
  });
  const subMap = Object.fromEntries(submissions.map((s) => [s.id, s]));
  const enriched = await Promise.all(
    timelines.map(async (t) => {
      var _a, _b, _c, _d;
      let githubProgress = 0;
      let repoInfo = null;
      let ghMilestones = [];
      let recentCommits = [];
      if (t.githubRepo) {
        try {
          const [info, milestones, commits] = await Promise.allSettled([
            getRepoInfo(t.githubRepo),
            getRepoMilestones(t.githubRepo),
            getRecentCommits(t.githubRepo, 5)
          ]);
          if (info.status === "fulfilled") repoInfo = info.value;
          if (milestones.status === "fulfilled") ghMilestones = (_a = milestones.value) != null ? _a : [];
          if (commits.status === "fulfilled") recentCommits = ((_b = commits.value) != null ? _b : []).map((c) => {
            var _a2, _b2, _c2, _d2;
            return {
              sha: c.sha.substring(0, 7),
              message: c.commit.message.split("\n")[0].substring(0, 72),
              author: (_b2 = (_a2 = c.author) == null ? void 0 : _a2.login) != null ? _b2 : c.commit.author.name,
              avatar: (_d2 = (_c2 = c.author) == null ? void 0 : _c2.avatar_url) != null ? _d2 : null,
              date: c.commit.author.date,
              url: c.html_url
            };
          });
          githubProgress = calculateGitHubProgress(ghMilestones, repoInfo != null ? repoInfo : void 0);
        } catch {
        }
      }
      const dbProgress = (() => {
        const ms = t.milestones;
        if (!ms.length) return 0;
        const done = ms.filter((m) => m.status === "COMPLETED").length;
        return Math.round(done / ms.length * 100);
      })();
      return {
        id: t.id,
        submissionId: t.submissionId,
        projectName: (_d = (_c = subMap[t.submissionId]) == null ? void 0 : _c.projectName) != null ? _d : "Project",
        status: t.status,
        startDate: t.startDate,
        endDate: t.endDate,
        milestones: t.milestones,
        githubRepo: t.githubRepo,
        progress: t.githubRepo ? githubProgress : dbProgress,
        github: t.githubRepo ? {
          repoInfo,
          milestones: ghMilestones,
          recentCommits
        } : null
      };
    })
  );
  return enriched;
});

export { index_get as default };
//# sourceMappingURL=index.get5.mjs.map
