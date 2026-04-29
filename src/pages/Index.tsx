import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Save, RotateCcw, Cpu, Loader2, LogIn, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { ComponentCard } from "@/components/ComponentCard";
import { ComponentSelector } from "@/components/ComponentSelector";
import { BottleneckGauge } from "@/components/BottleneckGauge";
import { SmartAlternatives } from "@/components/SmartAlternatives";
import { SavedBuilds } from "@/components/SavedBuilds";
import { HeroSection } from "@/components/HeroSection";
import { useBuilds, useSaveBuild, useDeleteBuild } from "@/hooks/use-builds";
import {
  calculateBottleneckFromAPI,
  type BottleneckAnalysis,
  type ComponentType,
  type PCComponent,
} from "@/lib/pc-data";

const COMPONENT_TYPES: ComponentType[] = ["cpu", "gpu", "ram", "motherboard"];

export default function Index() {
  const { toast } = useToast();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const builderRef = useRef<HTMLDivElement>(null);
  const [build, setBuild] = useState<Record<ComponentType, PCComponent | null>>({
    cpu: null, gpu: null, ram: null, motherboard: null,
  });
  const [selectorType, setSelectorType] = useState<ComponentType | null>(null);
  const [buildCount, setBuildCount] = useState(0);

  const { data: savedBuilds = [], isLoading: buildsLoading } = useBuilds();
  const saveBuildMutation = useSaveBuild();
  const deleteBuildMutation = useDeleteBuild();

  const [analysis, setAnalysis] = useState<BottleneckAnalysis>({
    percentage: 0,
    bottleneckComponent: "",
    message: "",
    alternatives: [],
    compatibility: { compatible: true, warnings: [] },
  });
  const [analysisLoading, setAnalysisLoading] = useState(false);

  const hasComponents = Object.values(build).some(Boolean);

  const fetchAnalysis = useCallback(async () => {
    if (!hasComponents) {
      setAnalysis({ percentage: 0, bottleneckComponent: "", message: "", alternatives: [], compatibility: { compatible: true, warnings: [] } });
      return;
    }
    if (!build.cpu || !build.gpu) {
      setAnalysis({
        percentage: 0,
        bottleneckComponent: "",
        message: "Select both a CPU and GPU to calculate bottleneck.",
        alternatives: [],
        compatibility: { compatible: true, warnings: [] },
      });
      return;
    }
    setAnalysisLoading(true);
    try {
      const result = await calculateBottleneckFromAPI(build);
      setAnalysis(result);
    } catch (err) {
      console.error("Error fetching bottleneck analysis:", err);
    } finally {
      setAnalysisLoading(false);
    }
  }, [build, hasComponents]);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  const suggestions = analysis.alternatives;

  const totalPrice = Object.values(build).reduce((sum, c) => sum + (c?.price ?? 0), 0);

  const handleSelect = (component: PCComponent) => {
    setBuild((prev) => {
      const next = { ...prev, [component.type]: component };
      // When CPU changes, clear RAM and motherboard (compatibility may differ)
      if (component.type === "cpu") {
        next.ram = null;
        next.motherboard = null;
      }
      return next;
    });
    toast({ title: `${component.name} added`, description: "Your build has been updated." });
  };

  const handleSwap = (component: PCComponent) => {
    setBuild((prev) => ({ ...prev, [component.type]: component }));
    toast({ title: "Component swapped!", description: `Upgraded to ${component.name}` });
  };

  const handleReset = () => {
    setBuild({ cpu: null, gpu: null, ram: null, motherboard: null });
    toast({ title: "Build reset", description: "All components cleared." });
  };

  const handleSave = () => {
    if (!hasComponents) return;
    if (!isAuthenticated) {
      toast({ title: "Login required", description: "Please log in to save your builds.", variant: "destructive" });
      navigate("/auth");
      return;
    }
    const name = `Build ${savedBuilds.length + buildCount + 1}`;
    setBuildCount((c) => c + 1);
    saveBuildMutation.mutate(
      { name, build, bottleneckPercentage: analysis.percentage },
      {
        onSuccess: () => toast({ title: "Build saved!", description: `"${name}" has been saved.` }),
        onError: (err) => toast({ title: "Save failed", description: err.message, variant: "destructive" }),
      }
    );
  };

  const handleLogout = async () => {
    await logout();
    toast({ title: "Logged out", description: "You have been signed out." });
  };

  const handleLoadBuild = (b: { cpu: PCComponent | null; gpu: PCComponent | null; ram: PCComponent | null; motherboard: PCComponent | null; name: string }) => {
    setBuild({ cpu: b.cpu, gpu: b.gpu, ram: b.ram, motherboard: b.motherboard });
    toast({ title: "Build loaded", description: `"${b.name}" has been loaded.` });
  };

  const handleDeleteBuild = (id: string) => {
    deleteBuildMutation.mutate(id, {
      onSuccess: () => toast({ title: "Build deleted" }),
    });
  };

  const scrollToBuilder = () => {
    builderRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    // Trigger a subtle pulse on the builder section
    builderRef.current?.classList.add("ring-2", "ring-primary/40", "rounded-2xl");
    setTimeout(() => {
      builderRef.current?.classList.remove("ring-2", "ring-primary/40", "rounded-2xl");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <header className="border-b border-border glass sticky top-0 z-40">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-primary/10 neon-glow">
              <Cpu className="h-5 w-5 text-primary" />
            </div>
            <span className="font-display text-sm font-bold text-foreground tracking-wider uppercase">
              RigCheck
            </span>
          </div>
          <div className="flex items-center gap-2">
            {hasComponents && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-sm font-display font-bold text-primary mr-2"
              >
                ${totalPrice.toLocaleString()}
              </motion.span>
            )}
            <Button variant="outline" size="sm" onClick={handleReset} disabled={!hasComponents}
              className="border-border hover:border-primary hover:text-primary gap-1.5 text-xs">
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!hasComponents || saveBuildMutation.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 text-xs neon-glow">
              {saveBuildMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save Build
            </Button>

            {/* Auth buttons */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2 ml-2 border-l border-border pl-2">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  {user?.fullName || user?.email?.split("@")[0]}
                </span>
                <Button variant="ghost" size="sm" onClick={handleLogout}
                  className="text-xs text-muted-foreground hover:text-destructive gap-1">
                  <LogOut className="h-3.5 w-3.5" /> Logout
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => navigate("/auth")}
                className="ml-2 border-border hover:border-primary hover:text-primary gap-1.5 text-xs">
                <LogIn className="h-3.5 w-3.5" /> Login
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <HeroSection onScrollToBuilder={scrollToBuilder} />

      <main className="container py-16 space-y-16">
        {/* Builder Canvas */}
        <section ref={builderRef} className="transition-all duration-700 scroll-mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="h-[2px] w-8 bg-primary rounded-full" />
            <h2 className="font-display text-sm font-bold text-foreground tracking-wider uppercase">
              Select Your Components
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {COMPONENT_TYPES.map((type, i) => (
              <motion.div
                key={type}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <ComponentCard
                  type={type}
                  component={build[type]}
                  onSelect={() => setSelectorType(type)}
                />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Analysis Row */}
        {hasComponents && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            <motion.section
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-8 flex items-center justify-center"
            >
              {analysisLoading ? (
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              ) : (
                <BottleneckGauge
                  percentage={analysis.percentage}
                  message={analysis.message}
                  bottleneckComponent={analysis.bottleneckComponent}
                  compatibilityWarnings={analysis.compatibility?.warnings}
                />
              )}
            </motion.section>

            <SmartAlternatives suggestions={suggestions} onSwap={handleSwap} />
          </motion.div>
        )}

        {/* Saved Builds */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="h-[2px] w-8 bg-accent rounded-full" />
            <h2 className="font-display text-sm font-bold text-foreground tracking-wider uppercase">
              Saved Builds
            </h2>
          </motion.div>
          {!isAuthenticated ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm mb-3">Log in to save and manage your builds</p>
              <Button variant="outline" size="sm" onClick={() => navigate("/auth")}
                className="gap-1.5 text-xs border-border hover:border-primary hover:text-primary">
                <LogIn className="h-3.5 w-3.5" /> Log In
              </Button>
            </div>
          ) : buildsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <SavedBuilds builds={savedBuilds} onLoad={handleLoadBuild} onDelete={handleDeleteBuild} />
          )}
        </section>
      </main>

      {/* Component Selector Modal */}
      {selectorType && (
        <ComponentSelector
          type={selectorType}
          onSelect={handleSelect}
          onClose={() => setSelectorType(null)}
          currentId={build[selectorType]?.id}
          selectedCpuId={build.cpu?.id ?? null}
        />
      )}
    </div>
  );
}
