import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, AlertCircle } from "lucide-react";

interface BottleneckGaugeProps {
  percentage: number;
  message: string;
  bottleneckComponent: string;
  compatibilityWarnings?: string[];
}

export function BottleneckGauge({ percentage, message, bottleneckComponent, compatibilityWarnings = [] }: BottleneckGaugeProps) {
  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage <= 10) return "text-success";
    if (percentage <= 20) return "text-primary";
    if (percentage <= 35) return "text-warning";
    return "text-destructive";
  };

  const getStrokeColor = () => {
    if (percentage <= 10) return "url(#gaugeGradientGood)";
    if (percentage <= 20) return "url(#gaugeGradientOk)";
    if (percentage <= 35) return "url(#gaugeGradientWarn)";
    return "url(#gaugeGradientBad)";
  };

  const getIcon = () => {
    if (percentage <= 10) return <CheckCircle2 className="h-5 w-5 text-success" />;
    if (percentage <= 25) return <AlertCircle className="h-5 w-5 text-primary" />;
    return <AlertTriangle className="h-5 w-5 text-warning" />;
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative w-52 h-52">
        {/* Pulsing glow behind */}
        <motion.div
          className="absolute inset-4 rounded-full"
          animate={{
            boxShadow: [
              `0 0 20px hsla(190, 95%, 50%, 0.1)`,
              `0 0 40px hsla(190, 95%, 50%, 0.2)`,
              `0 0 20px hsla(190, 95%, 50%, 0.1)`,
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        <svg className="w-52 h-52 -rotate-90" viewBox="0 0 160 160">
          <defs>
            <linearGradient id="gaugeGradientGood" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(150, 70%, 45%)" />
              <stop offset="100%" stopColor="hsl(190, 95%, 50%)" />
            </linearGradient>
            <linearGradient id="gaugeGradientOk" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(190, 95%, 50%)" />
              <stop offset="100%" stopColor="hsl(265, 85%, 60%)" />
            </linearGradient>
            <linearGradient id="gaugeGradientWarn" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(38, 92%, 55%)" />
              <stop offset="100%" stopColor="hsl(0, 72%, 55%)" />
            </linearGradient>
            <linearGradient id="gaugeGradientBad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(0, 72%, 55%)" />
              <stop offset="100%" stopColor="hsl(0, 72%, 40%)" />
            </linearGradient>
          </defs>
          <circle cx="80" cy="80" r="70" fill="none" stroke="hsl(220, 15%, 14%)" strokeWidth="10" />
          <motion.circle
            cx="80" cy="80" r="70" fill="none"
            stroke={getStrokeColor()}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={`text-5xl font-display font-bold ${getColor()}`}
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
          >
            {percentage}%
          </motion.span>
          <span className="text-xs text-muted-foreground uppercase tracking-widest font-display mt-1">Bottleneck</span>
        </div>
      </div>

      {bottleneckComponent && percentage > 10 && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive/10 border border-destructive/20"
        >
          {getIcon()}
          <span className="text-sm font-medium text-destructive">
            {bottleneckComponent} is limiting performance
          </span>
        </motion.div>
      )}

      <p className="text-sm text-muted-foreground text-center max-w-xs leading-relaxed">{message}</p>

      {compatibilityWarnings.length > 0 && (
        <div className="w-full max-w-xs space-y-2 mt-2">
          {compatibilityWarnings.map((warning, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="flex items-start gap-2 px-3 py-2 rounded-lg bg-warning/10 border border-warning/30 text-warning text-xs"
            >
              <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span>{warning}</span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
