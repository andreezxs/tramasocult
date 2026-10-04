import { useEffect, useState } from "react";

import { subscribeShaderBackend, type ShaderBackend } from "@/lib/gpu";

const LABELS: Record<ShaderBackend, string> = {
  webgpu: "GPU · WebGPU",
  webgl2: "GPU · WebGL2",
  canvas2d: "GPU · Canvas",
};

export function GpuBadge() {
  const [backend, setBackend] = useState<ShaderBackend | null>(null);

  useEffect(() => subscribeShaderBackend(setBackend), []);

  return <span className="gpu-badge">{backend ? LABELS[backend] : "GPU · shaders"}</span>;
}
