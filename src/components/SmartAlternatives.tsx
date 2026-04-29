import { motion } from "framer-motion";
import { ArrowRightLeft, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PCComponent } from "@/lib/pc-data";

interface SmartAlternativesProps {
  suggestions: PCComponent[];
  onSwap: (component: PCComponent) => void;
}

export function SmartAlternatives({ suggestions, onSwap }: SmartAlternativesProps) {
  if (suggestions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-6 relative overflow-hidden"
    >
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-accent/10 to-transparent rounded-bl-full pointer-events-none" />

      <div className="flex items-center gap-2 mb-1 relative">
        <motion.div
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        >
          <Sparkles className="h-5 w-5 text-accent" />
        </motion.div>
        <h2 className="font-display text-xl font-bold text-foreground">Smart Upgrades</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-5 relative">
        Swap these components to unlock more performance
      </p>

      <div className="grid gap-3 relative">
        {suggestions.map((comp, i) => (
          <motion.div
            key={comp.id}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ scale: 1.02, x: 4 }}
            className="flex items-center justify-between p-4 rounded-lg border border-border bg-secondary/20 hover:border-primary/30 hover:bg-primary/5 transition-colors group"
          >
            <div className="flex-1">
              <p className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                {comp.name}
              </p>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-primary font-display font-bold text-lg">${comp.price}</span>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-success" />
                  <span className="text-xs text-success font-medium">Score: {comp.performanceScore}</span>
                </div>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => onSwap(comp)}
              className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground gap-1.5 transition-all"
            >
              <ArrowRightLeft className="h-3.5 w-3.5" />
              Swap
            </Button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
