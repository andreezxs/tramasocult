import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

import { startShaderEngine, type ShaderBackend } from "@/lib/gpu";
import { cn } from "@/lib/utils";

export function ShaderField({
  className,
  intensity = 1,
  onBackend,
}: {
  className?: string;
  intensity?: number;
  onBackend?: (backend: ShaderBackend) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = startShaderEngine(canvas, {
      reducedMotion: Boolean(reduce),
      intensity,
      ...(onBackend ? { onBackend } : {}),
    });
    return () => engine.destroy();
  }, [intensity, onBackend, reduce]);

  return <canvas ref={canvasRef} className={cn("shader-field", className)} aria-hidden="true" />;
}
