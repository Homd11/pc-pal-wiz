import { motion } from "framer-motion";
import { Trash2, ChevronRight, Layers } from "lucide-react";
import type { PCBuild } from "@/lib/pc-data";

interface SavedBuildsProps {
  builds: PCBuild[];
  onLoad: (build: PCBuild) => void;
  onDelete: (id: string) => void;
}

export function SavedBuilds({ builds, onLoad, onDelete }: SavedBuildsProps) {
  if (builds.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-xl border border-dashed border-border p-12 text-center"
      >
        <Layers className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-muted-foreground text-sm">No saved builds yet.</p>
        <p className="text-muted-foreground/60 text-xs mt-1">Create and save your first build above!</p>
      </motion.div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {builds.map((build, i) => (
        <motion.div
          key={build.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          whileHover={{ y: -4 }}
          className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-5 group cursor-pointer relative overflow-hidden"
          onClick={() => onLoad(build)}
        >
          {/* Hover glow */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/0 group-hover:via-primary/50 to-transparent transition-all duration-500" />

          <div className="flex items-start justify-between mb-3">
            <h3 className="font-display font-bold text-foreground text-lg">{build.name}</h3>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(build.id); }}
              className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-all"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </button>
          </div>

          <div className="space-y-1.5 text-xs text-muted-foreground">
            {build.cpu && <p className="truncate">🔹 {build.cpu.name}</p>}
            {build.gpu && <p className="truncate">🔹 {build.gpu.name}</p>}
            {build.ram && <p className="truncate">🔹 {build.ram.name}</p>}
            {build.motherboard && <p className="truncate">🔹 {build.motherboard.name}</p>}
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
            <span className={`text-xs font-display font-bold ${
              build.bottleneckPercentage <= 10 ? "text-success" :
              build.bottleneckPercentage <= 25 ? "text-primary" : "text-warning"
            }`}>
              {build.bottleneckPercentage}% bottleneck
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
