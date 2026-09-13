/**
 * Effect #7: AI Priority Queue re-sort
 * Ranked list of acquisition projects with priority scores. On "recalculate", scores update
 * and rows smoothly animate to their new list position using motion `layout`.
 * Rank badges color-shift for the top 2 positions.
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { RefreshCw, Sparkles, TrendingUp, AlertTriangle, ChevronRight, ShieldAlert } from 'lucide-react';
import { ProjectItem } from '../../types/nlams';

interface AIPriorityQueueProps {
  initialProjects: ProjectItem[];
  onSelectProject?: (project: ProjectItem) => void;
}

export function AIPriorityQueue({ initialProjects, onSelectProject }: AIPriorityQueueProps) {
  const [projects, setProjects] = useState<ProjectItem[]>(initialProjects);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [recalcCount, setRecalcCount] = useState(0);

  // Recalculate and re-sort
  const handleRecalculate = () => {
    setIsRecalculating(true);

    setTimeout(() => {
      setProjects((prev) => {
        const updated = prev.map((p) => {
          // Jitter scores slightly to trigger ranking shift
          const scoreDelta = (Math.random() - 0.48) * 8;
          const newScore = Math.max(50, Math.min(99, Math.round(p.priorityScore + scoreDelta)));
          return {
            ...p,
            priorityScore: newScore,
          };
        });
        // Sort descending by priorityScore
        return updated.sort((a, b) => b.priorityScore - a.priorityScore);
      });
      setIsRecalculating(false);
      setRecalcCount((c) => c + 1);
    }, 450);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-[#0ea5a3]/10 text-[#0ea5a3]">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-[#0b2c52]">
              AI National Corridor Priority Queue
            </h3>
          </div>
          <p className="text-[11px] text-[#64748b] mt-0.5">
            Optimized rank based on GatiShakti freight criticality, legal title risks, & fund utilization
          </p>
        </div>

        <button
          onClick={handleRecalculate}
          disabled={isRecalculating}
          className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-[#eef4fa] text-[#0b2c52] hover:bg-[#0ea5a3] hover:text-white transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRecalculating ? 'animate-spin' : ''}`} />
          <span>{isRecalculating ? 'Recalculating Model...' : 'Recalculate Weights'}</span>
        </button>
      </div>

      {recalcCount > 0 && (
        <div className="mt-3 p-2 bg-[#16a34a]/10 border border-[#16a34a]/20 rounded-md text-[11px] font-semibold text-[#16a34a] flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Queue reordered dynamically via gradient-boosted priority weights.</span>
        </div>
      )}

      {/* Ranked rows with motion `layout` prop for seamless re-sorting */}
      <div className="mt-4 space-y-2.5">
        {projects.map((project, index) => {
          const rank = index + 1;
          const isTop1 = rank === 1;
          const isTop2 = rank === 2;

          return (
            <motion.div
              key={project.id}
              layout
              transition={{
                type: 'spring',
                stiffness: 350,
                damping: 30,
              }}
              onClick={() => onSelectProject?.(project)}
              className={`p-3.5 rounded-xl border transition-colors flex items-center justify-between gap-3 cursor-pointer group ${
                isTop1
                  ? 'bg-amber-50/40 border-amber-300/80 shadow-xs'
                  : isTop2
                  ? 'bg-slate-50 border-slate-300/80'
                  : 'bg-white border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Rank Badge with top-2 color shift */}
                <motion.div
                  layout
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                    isTop1
                      ? 'bg-amber-500 text-white shadow-sm'
                      : isTop2
                      ? 'bg-[#0b2c52] text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  #{rank}
                </motion.div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-[#0b2c52] truncate group-hover:text-[#0ea5a3] transition-colors">
                      {project.name}
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                      {project.code}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mt-1 text-[11px] text-[#64748b]">
                    <span>{project.district}, {project.state}</span>
                    <span>•</span>
                    <span>{project.acres.toLocaleString('en-IN')} Acres</span>
                    <span>•</span>
                    <span className="font-semibold text-slate-700">{project.stage}</span>
                  </div>
                </div>
              </div>

              {/* Score & Risk Badge */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className="flex items-baseline justify-end gap-1">
                    <span className="text-[10px] text-slate-400 font-semibold">Priority</span>
                    <span
                      className={`text-sm font-extrabold tabular-nums ${
                        isTop1
                          ? 'text-amber-600'
                          : isTop2
                          ? 'text-[#0b2c52]'
                          : 'text-slate-700'
                      }`}
                    >
                      {project.priorityScore}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                      project.riskScore > 65
                        ? 'bg-red-100 text-red-700'
                        : project.riskScore > 35
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    Risk: {project.riskScore}%
                  </span>
                </div>

                <div className="p-1 rounded-md text-slate-400 group-hover:text-[#0ea5a3] group-hover:translate-x-0.5 transition-all">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
