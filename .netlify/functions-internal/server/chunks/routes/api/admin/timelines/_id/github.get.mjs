import { d as defineEventHandler, r as requireAdmin, f as getRouterParam, c as createError, p as prisma, k as getRepoInfo, x as getCommitActivity, y as getCodeFrequency, z as getRepoMilestones, A as getRepoLanguages, B as getRecentCommits, C as getRecentReleases, D as getPullRequests, E as getContributors, F as calculateGitHubProgress } from '../../../../../_/nitro.mjs';
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

const github_get = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e;
  await requireAdmin(event);
  const timelineId = getRouterParam(event, "id");
  if (!timelineId) throw createError({ statusCode: 400, message: "Missing timeline ID" });
  const timeline = await prisma.projectTimeline.findUnique({
    where: { id: timelineId },
    include: { milestones: { orderBy: { order: "asc" } } }
  });
  if (!timeline) throw createError({ statusCode: 404, message: "Timeline not found" });
  if (!timeline.githubRepo) throw createError({ statusCode: 400, message: "No GitHub repo linked to this timeline" });
  const repo = timeline.githubRepo;
  const [
    repoInfoResult,
    commitActivityResult,
    codeFrequencyResult,
    milestonesResult,
    languagesResult,
    commitsResult,
    releasesResult,
    prsResult,
    contributorsResult
  ] = await Promise.allSettled([
    getRepoInfo(repo),
    getCommitActivity(repo),
    getCodeFrequency(repo),
    getRepoMilestones(repo),
    getRepoLanguages(repo),
    getRecentCommits(repo, 25),
    getRecentReleases(repo, 10),
    getPullRequests(repo, "all"),
    getContributors(repo)
  ]);
  const ok = (r) => r.status === "fulfilled" ? r.value : null;
  const repoInfo = ok(repoInfoResult);
  const ghMilestones = (_a = ok(milestonesResult)) != null ? _a : [];
  const ghPRs = (_b = ok(prsResult)) != null ? _b : [];
  const progress = calculateGitHubProgress(ghMilestones, repoInfo != null ? repoInfo : void 0, ghPRs);
  const mergedMilestones = timeline.milestones.map((m) => {
    var _a2;
    const ghM = m.githubMilestoneId ? (_a2 = ghMilestones.find((gm) => gm.number === m.githubMilestoneId)) != null ? _a2 : null : null;
    return { ...m, github: ghM };
  });
  return {
    timeline: { ...timeline, milestones: mergedMilestones },
    github: {
      repo: repoInfo,
      progress,
      commitActivity: ok(commitActivityResult),
      // null means still computing
      codeFrequency: ok(codeFrequencyResult),
      // null means still computing
      milestones: ghMilestones,
      languages: (_c = ok(languagesResult)) != null ? _c : {},
      recentCommits: (_d = ok(commitsResult)) != null ? _d : [],
      releases: (_e = ok(releasesResult)) != null ? _e : [],
      pullRequests: ghPRs,
      mergedPRs: ghPRs.filter((pr) => pr.merged_at),
      contributors: ok(contributorsResult)
      // null means still computing
    }
  };
});

export { github_get as default };
//# sourceMappingURL=github.get.mjs.map
