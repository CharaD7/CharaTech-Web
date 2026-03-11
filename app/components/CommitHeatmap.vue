<script setup lang="ts">
/**
 * CommitHeatmap — GitHub-style 52-week × 7-day commit activity calendar.
 * Renders pure SVG with CharaTech purple intensity scale.
 * Data format: CommitWeek[] from GitHub stats/commit_activity endpoint.
 */

interface CommitWeek {
  week: number   // Unix timestamp (Sunday)
  days: number[] // [sun, mon, tue, wed, thu, fri, sat]
  total: number
}

const props = defineProps<{
  data: CommitWeek[] | null
  loading?: boolean
}>()

// ─── Layout constants ─────────────────────────────────────────────────────
const CELL = 11        // cell size in px
const GAP = 2          // gap between cells
const STRIDE = CELL + GAP  // 13px per column/row
const DAY_LABEL_W = 28 // left space for Mon/Wed/Fri labels
const MONTH_LABEL_H = 20 // top space for month names
const COLS = 52
const ROWS = 7

const SVG_W = DAY_LABEL_W + COLS * STRIDE
const SVG_H = MONTH_LABEL_H + ROWS * STRIDE

// ─── Color scale (purple theme) ───────────────────────────────────────────
function cellColor(count: number): string {
  if (count === 0) return 'rgba(255,255,255,0.05)'
  if (count <= 2)  return 'rgba(109,40,217,0.4)'
  if (count <= 5)  return 'rgba(124,58,237,0.65)'
  if (count <= 9)  return 'rgba(139,92,246,0.85)'
  return 'rgba(167,139,250,1)'
}

// ─── Computed cells ───────────────────────────────────────────────────────
interface Cell {
  x: number; y: number
  count: number; color: string
  date: string; day: number; col: number
}

const cells = computed<Cell[]>(() => {
  if (!props.data) return []
  const out: Cell[] = []

  props.data.forEach((week, col) => {
    const weekDate = new Date(week.week * 1000)
    week.days.forEach((count, dayIdx) => {
      const d = new Date(weekDate)
      d.setDate(weekDate.getDate() + dayIdx)
      out.push({
        x: DAY_LABEL_W + col * STRIDE,
        y: MONTH_LABEL_H + dayIdx * STRIDE,
        count,
        color: cellColor(count),
        date: d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }),
        day: dayIdx,
        col,
      })
    })
  })
  return out
})

// ─── Month labels ─────────────────────────────────────────────────────────
interface MonthLabel { x: number; label: string }

const monthLabels = computed<MonthLabel[]>(() => {
  if (!props.data) return []
  const labels: MonthLabel[] = []
  let lastMonth = -1

  props.data.forEach((week, col) => {
    const d = new Date(week.week * 1000)
    const month = d.getMonth()
    if (month !== lastMonth) {
      labels.push({
        x: DAY_LABEL_W + col * STRIDE,
        label: d.toLocaleDateString('en-US', { month: 'short' }),
      })
      lastMonth = month
    }
  })
  return labels
})

// ─── Tooltip ──────────────────────────────────────────────────────────────
const tooltip = ref<{ x: number; y: number; text: string } | null>(null)

function showTooltip(e: MouseEvent, cell: Cell) {
  const rect = (e.currentTarget as SVGElement).closest('svg')!.getBoundingClientRect()
  tooltip.value = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top - 36,
    text: `${cell.count} commit${cell.count !== 1 ? 's' : ''} · ${cell.date}`,
  }
}
function hideTooltip() { tooltip.value = null }

// ─── Summary stats ────────────────────────────────────────────────────────
const totalCommits = computed(() => props.data?.reduce((s, w) => s + w.total, 0) ?? 0)
const maxWeek = computed(() => props.data?.reduce((m, w) => w.total > m.total ? w : m, { total: 0, week: 0, days: [] as number[] }))
const streakWeeks = computed(() => {
  if (!props.data) return 0
  let streak = 0
  for (let i = props.data.length - 1; i >= 0; i--) {
    if (props.data[i].total > 0) streak++
    else break
  }
  return streak
})
</script>

<template>
  <div class="commit-heatmap">
    <!-- Loading skeleton -->
    <div v-if="loading" class="flex flex-col gap-2 animate-pulse">
      <div class="h-4 w-24 bg-white/10 rounded mb-2" />
      <div class="h-[130px] w-full bg-white/5 rounded-xl" />
    </div>

    <!-- No data yet (GitHub still computing) -->
    <div v-else-if="!data" class="flex items-center justify-center h-[130px] text-white/40 text-sm italic">
      ⏳ GitHub is computing commit statistics — refresh in a few seconds
    </div>

    <!-- Heatmap -->
    <div v-else class="relative">
      <!-- Summary row -->
      <div class="flex gap-6 mb-3 text-xs text-white/60">
        <span><span class="text-white font-semibold">{{ totalCommits.toLocaleString() }}</span> commits in the last year</span>
        <span v-if="streakWeeks > 0"><span class="text-purple-400 font-semibold">{{ streakWeeks }}w</span> active streak</span>
        <span v-if="maxWeek && maxWeek.total > 0">Peak week: <span class="text-purple-400 font-semibold">{{ maxWeek.total }}</span> commits</span>
      </div>

      <!-- SVG grid -->
      <div class="relative overflow-x-auto">
        <svg
          :width="SVG_W"
          :height="SVG_H"
          class="block"
          style="max-width: 100%"
        >
          <!-- Month labels -->
          <text
            v-for="ml in monthLabels"
            :key="ml.x"
            :x="ml.x"
            :y="13"
            font-size="10"
            fill="rgba(255,255,255,0.45)"
            font-family="system-ui, sans-serif"
          >{{ ml.label }}</text>

          <!-- Day labels: Mon, Wed, Fri -->
          <text
            v-for="(label, i) in ['', 'Mon', '', 'Wed', '', 'Fri', '']"
            :key="i"
            :x="0"
            :y="MONTH_LABEL_H + i * STRIDE + CELL - 1"
            font-size="9"
            fill="rgba(255,255,255,0.4)"
            font-family="system-ui, sans-serif"
          >{{ label }}</text>

          <!-- Cells -->
          <rect
            v-for="(cell, i) in cells"
            :key="i"
            :x="cell.x"
            :y="cell.y"
            :width="CELL"
            :height="CELL"
            :fill="cell.color"
            rx="2"
            ry="2"
            class="cursor-pointer transition-opacity duration-150 hover:opacity-80"
            @mouseenter="showTooltip($event, cell)"
            @mouseleave="hideTooltip"
          />
        </svg>

        <!-- Tooltip -->
        <div
          v-if="tooltip"
          class="absolute z-20 px-2 py-1 rounded text-xs text-white bg-gray-900/95 border border-white/10 pointer-events-none whitespace-nowrap shadow-lg"
          :style="{ left: `${tooltip.x}px`, top: `${tooltip.y}px`, transform: 'translateX(-50%)' }"
        >
          {{ tooltip.text }}
        </div>
      </div>

      <!-- Legend -->
      <div class="flex items-center gap-1 mt-2 text-xs text-white/40">
        <span>Less</span>
        <div v-for="level in [0, 2, 5, 9, 15]" :key="level"
          class="w-[11px] h-[11px] rounded-sm"
          :style="{ background: cellColor(level) }"
        />
        <span>More</span>
      </div>
    </div>
  </div>
</template>
