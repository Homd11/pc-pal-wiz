import { useState } from "react";
import { motion } from "framer-motion";
import { Cpu, MonitorSpeaker, MemoryStick, CircuitBoard, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ComponentType, PCComponent } from "@/lib/pc-data";
import cpuImg from "@/assets/cpu-hero.png";
import gpuImg from "@/assets/gpu-hero.png";
import ramImg from "@/assets/ram-hero.png";
import mbImg from "@/assets/motherboard-hero.png";

const ICONS: Record<ComponentType, React.ElementType> = {
  cpu: Cpu, gpu: MonitorSpeaker, ram: MemoryStick, motherboard: CircuitBoard,
};

const IMAGES: Record<ComponentType, string> = {
  cpu: cpuImg, gpu: gpuImg, ram: ramImg, motherboard: mbImg,
};

const LABELS: Record<ComponentType, string> = {
  cpu: "Processor", gpu: "Graphics Card", ram: "Memory", motherboard: "Motherboard",
};

interface ComponentCardProps {
  type: ComponentType;
  component: PCComponent | null;
  onSelect: () => void;
}

export function ComponentCard({ type, component, onSelect }: ComponentCardProps) {
  const Icon = ICONS[type];
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setRotateY(x * 20);
    setRotateX(-y * 20);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0, rotateX, rotateY }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      transition={{ rotateX: { type: "spring", stiffness: 300, damping: 20 }, rotateY: { type: "spring", stiffness: 300, damping: 20 } }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 800, transformStyle: "preserve-3d" }}
      className="relative rounded-xl border border-border bg-card/80 backdrop-blur-sm overflow-hidden cursor-pointer group"
      onClick={onSelect}
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-accent/5" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent" />
      </div>

      {/* Component image */}
      <div className="relative h-36 flex items-center justify-center overflow-hidden bg-gradient-to-b from-secondary/50 to-transparent">
        <motion.img
          src={IMAGES[type]}
          alt={LABELS[type]}
          className="h-28 w-28 object-contain drop-shadow-[0_0_15px_hsla(190,95%,50%,0.3)]"
          whileHover={{ scale: 1.1, rotate: 3 }}
          transition={{ type: "spring", stiffness: 300 }}
        />
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primary/10">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-display font-semibold">
              {LABELS[type]}
            </span>
          </div>
        </div>

        {component ? (
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground text-sm leading-tight">{component.name}</h3>
            <div className="flex items-center justify-between">
              <span className="text-primary font-display font-bold text-xl">${component.price}</span>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-20 rounded-full bg-secondary overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                    initial={{ width: 0 }}
                    animate={{ width: `${component.performanceScore}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
                <span className="text-xs font-mono text-muted-foreground">{component.performanceScore}</span>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs border-border hover:border-primary hover:text-primary hover:bg-primary/5 transition-all"
            >
              Change Component
            </Button>
          </div>
        ) : (
          <motion.div
            className="flex flex-col items-center justify-center py-6 gap-3"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="p-3 rounded-full border-2 border-dashed border-border group-hover:border-primary group-hover:bg-primary/5 transition-all duration-300">
              <Plus className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              Add {LABELS[type]}
            </span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
