import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, ShieldCheck } from "lucide-react";
import { useComponents } from "@/hooks/use-components";
import { useCompatibleComponents } from "@/hooks/use-compatible";
import type { ComponentType, PCComponent } from "@/lib/pc-data";

interface ComponentSelectorProps {
  type: ComponentType;
  onSelect: (component: PCComponent) => void;
  onClose: () => void;
  currentId?: string;
  selectedCpuId?: string | null;
}

const LABELS: Record<ComponentType, string> = {
  cpu: "Processor",
  gpu: "Graphics Card",
  ram: "Memory",
  motherboard: "Motherboard",
};

export function ComponentSelector({ type, onSelect, onClose, currentId, selectedCpuId }: ComponentSelectorProps) {
  const { data: allComponents, isLoading: allLoading } = useComponents();
  const { data: compatible, isLoading: compatLoading } = useCompatibleComponents(
    (type === "ram" || type === "motherboard") ? selectedCpuId : null
  );

  // Use compatible list when available for ram/motherboard, otherwise fall back to all
  const useCompatible = (type === "ram" || type === "motherboard") && !!selectedCpuId && !!compatible;
  const components = useCompatible
    ? (type === "motherboard" ? compatible.compatibleMotherboards : compatible.compatibleRam)
    : (allComponents?.[type] ?? []);
  const isLoading = useCompatible ? compatLoading : allLoading;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-lg bg-card border border-border rounded-xl p-6 neon-glow"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">
                Select {LABELS[type]}
              </h2>
              {useCompatible && (
                <p className="flex items-center gap-1 text-xs text-emerald-400 mt-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Showing only compatible parts
                </p>
              )}
            </div>
            <button onClick={onClose} className="p-1 rounded-md hover:bg-secondary transition-colors">
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : components.map((comp) => (
              <motion.div
                key={comp.id}
                whileHover={{ scale: 1.01 }}
                className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${
                  comp.id === currentId
                    ? "border-primary bg-primary/5 neon-border"
                    : "border-border hover:border-primary/30 bg-secondary/30"
                }`}
                onClick={() => { onSelect(comp); onClose(); }}
              >
                <div className="flex-1">
                  <p className="font-medium text-sm text-foreground">{comp.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-primary font-display font-bold">${comp.price}</span>
                    <div className="flex items-center gap-1.5">
                      <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${comp.performanceScore}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{comp.performanceScore}</span>
                    </div>
                  </div>
                </div>
                {comp.id === currentId && (
                  <span className="text-xs text-primary font-medium">Selected</span>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
