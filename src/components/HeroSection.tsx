import { motion } from "framer-motion";
import { ChevronDown, Zap, Shield, TrendingUp } from "lucide-react";
import { ParticleField } from "./ParticleField";
import heroBg from "@/assets/hero-bg.jpg";

interface HeroSectionProps {
  onScrollToBuilder: () => void;
}

export function HeroSection({ onScrollToBuilder }: HeroSectionProps) {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
      </div>

      {/* Interactive particles */}
      <ParticleField />

      <div className="relative z-10 container text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Zap className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">Real-time Performance Analysis</span>
          </motion.div>

          <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-bold text-foreground tracking-tight leading-[0.9]">
            <span className="block">Build Your</span>
            <span className="block mt-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient-shift_3s_ease_infinite]">
              Dream PC
            </span>
          </h1>

          <motion.p
            className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Detect bottlenecks instantly. Get smart upgrade suggestions. 
            Build the most balanced rig possible.
          </motion.p>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 mt-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          {[
            { icon: Zap, label: "Instant Analysis" },
            { icon: Shield, label: "Compatibility Check" },
            { icon: TrendingUp, label: "Smart Suggestions" },
          ].map((f, i) => (
            <motion.div
              key={f.label}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card/60 border border-border/50 backdrop-blur-sm"
              whileHover={{ scale: 1.05, borderColor: "hsl(190, 95%, 50%)" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.1 }}
            >
              <f.icon className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">{f.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          className="mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <motion.button
            onClick={onScrollToBuilder}
            className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-display font-bold text-lg overflow-hidden"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="relative z-10">Start Building</span>
            <ChevronDown className="relative z-10 h-5 w-5 animate-bounce" />
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto]"
              animate={{ backgroundPosition: ["0% center", "200% center"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
