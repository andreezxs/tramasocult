export type ShaderBackend = "webgpu" | "webgl2" | "canvas2d";

export type ShaderEngineOptions = {
  reducedMotion?: boolean;
  intensity?: number;
  onBackend?: (backend: ShaderBackend) => void;
};

type StopHandle = {
  destroy: () => void;
};

type GpuNavigator = Navigator & {
  gpu?: {
    requestAdapter: () => Promise<{
      requestDevice: () => Promise<{
        createShaderModule: (desc: { code: string }) => unknown;
        createRenderPipeline: (desc: unknown) => unknown;
        createBuffer: (desc: unknown) => { destroy: () => void };
        createBindGroupLayout: (desc: unknown) => unknown;
        createPipelineLayout: (desc: unknown) => unknown;
        createBindGroup: (desc: unknown) => unknown;
        createCommandEncoder: () => {
          beginRenderPass: (desc: unknown) => {
            setPipeline: (p: unknown) => void;
            setBindGroup: (i: number, g: unknown) => void;
            draw: (n: number) => void;
            end: () => void;
          };
          finish: () => unknown;
        };
        queue: {
          writeBuffer: (buffer: unknown, offset: number, data: BufferSource) => void;
          submit: (cmds: unknown[]) => void;
        };
        addEventListener?: (type: string, fn: () => void) => void;
        destroy?: () => void;
      }>;
    } | null>;
    getPreferredCanvasFormat: () => string;
  };
};

const WGSL = `
struct Uniforms {
  resolution: vec2f,
  time: f32,
  quality: f32,
  pointer: vec2f,
  intensity: f32,
  _pad: f32,
};

@group(0) @binding(0) var<uniform> u: Uniforms;

@vertex
fn vs(@builtin(vertex_index) vi: u32) -> @builtin(position) vec4f {
  var pos = array<vec2f, 3>(
    vec2f(-1.0, -1.0),
    vec2f(3.0, -1.0),
    vec2f(-1.0, 3.0)
  );
  return vec4f(pos[vi], 0.0, 1.0);
}

fn hash21(p: vec2f) -> f32 {
  return fract(sin(dot(p, vec2f(127.1, 311.7))) * 43758.5453123);
}

fn noise(p: vec2f) -> f32 {
  let cell = floor(p);
  let f = fract(p);
  let s = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash21(cell), hash21(cell + vec2f(1.0, 0.0)), s.x),
    mix(hash21(cell + vec2f(0.0, 1.0)), hash21(cell + vec2f(1.0, 1.0)), s.x),
    s.y
  );
}

fn fbm(p0: vec2f) -> f32 {
  var p = p0;
  var v = 0.0;
  var a = 0.5;
  v += a * noise(p); p = p * 2.07 + vec2f(11.3, 3.1); a = a * 0.5;
  v += a * noise(p); p = p * 2.07 + vec2f(11.3, 3.1); a = a * 0.5;
  v += a * noise(p); p = p * 2.07 + vec2f(11.3, 3.1); a = a * 0.5;
  v += a * noise(p);
  return v;
}

@fragment
fn fs(@builtin(position) frag: vec4f) -> @location(0) vec4f {
  let res = u.resolution;
  var uv = (frag.xy - 0.5 * res) / min(res.x, res.y);
  let t = u.time * 0.12;
  let mouse = (u.pointer - vec2f(0.5, 0.5)) * 0.55;
  uv = uv - mouse * 0.18;

  let n1 = fbm(uv * 1.8 + vec2f(t * 0.35, -t * 0.22));
  let n2 = fbm(uv * 2.4 + vec2f(-t * 0.18, t * 0.3) + n1);
  let silk = sin(uv.y * 4.2 + n2 * 4.6 + t * 0.9);
  let band = smoothstep(0.18, 0.92, 0.5 + 0.5 * silk);
  let glow = smoothstep(1.2, 0.12, length(uv + vec2f(n1 - 0.5, n2 - 0.5) * 0.35));

  let green = vec3f(0.671, 0.878, 0.329);
  let orange = vec3f(0.980, 0.333, 0.235);
  let cream = vec3f(0.96, 0.95, 0.91);
  let ink = vec3f(0.02, 0.02, 0.024);

  var palette = mix(green, orange, 0.5 + 0.5 * sin(n2 * 5.0 + t));
  palette = mix(palette, cream, band * 0.18);

  var col = ink;
  col = col + palette * band * 0.72 * glow;
  col = col + green * pow(max(n1, 0.0), 3.0) * 0.28;
  col = col + orange * pow(max(n2, 0.0), 4.0) * 0.2;
  col = col + cream * (0.08 / (0.08 + length(uv))) * 0.12;

  let vig = smoothstep(1.38, 0.22, length(uv * vec2f(0.92, 1.08)));
  col = col * vig * u.intensity;
  col = col + vec3f((hash21(frag.xy + fract(u.time) * 47.0) - 0.5) * 0.03);
  return vec4f(col, 1.0);
}
`;

const VERT_GLSL = `#version 300 es
void main() {
  vec2 pos = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(pos * 2.0 - 1.0, 0.0, 1.0);
}
`;

const FRAG_GLSL = `#version 300 es
precision highp float;
uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uPointer;
uniform float uQuality;
uniform float uIntensity;
out vec4 fragColor;

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 cell = floor(p);
  vec2 f = fract(p);
  vec2 s = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash21(cell), hash21(cell + vec2(1.0, 0.0)), s.x),
    mix(hash21(cell + vec2(0.0, 1.0)), hash21(cell + vec2(1.0, 1.0)), s.x),
    s.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  v += a * noise(p); p = p * 2.07 + vec2(11.3, 3.1); a *= 0.5;
  v += a * noise(p); p = p * 2.07 + vec2(11.3, 3.1); a *= 0.5;
  v += a * noise(p); p = p * 2.07 + vec2(11.3, 3.1); a *= 0.5;
  v += a * noise(p);
  return v;
}

void main() {
  vec2 res = uResolution;
  vec2 uv = (gl_FragCoord.xy - 0.5 * res) / min(res.x, res.y);
  float t = uTime * 0.12;
  vec2 mouse = (uPointer - 0.5) * 0.55;
  uv -= mouse * 0.18;

  float n1 = fbm(uv * 1.8 + vec2(t * 0.35, -t * 0.22));
  float n2 = fbm(uv * 2.4 + vec2(-t * 0.18, t * 0.3) + n1);
  float silk = sin(uv.y * 4.2 + n2 * 4.6 + t * 0.9);
  float band = smoothstep(0.18, 0.92, 0.5 + 0.5 * silk);
  float glow = smoothstep(1.2, 0.12, length(uv + vec2(n1 - 0.5, n2 - 0.5) * 0.35));

  vec3 green = vec3(0.671, 0.878, 0.329);
  vec3 orange = vec3(0.980, 0.333, 0.235);
  vec3 cream = vec3(0.96, 0.95, 0.91);
  vec3 ink = vec3(0.02, 0.02, 0.024);

  vec3 palette = mix(green, orange, 0.5 + 0.5 * sin(n2 * 5.0 + t));
  palette = mix(palette, cream, band * 0.18);

  vec3 col = ink;
  col += palette * band * 0.72 * glow;
  col += green * pow(max(n1, 0.0), 3.0) * 0.28;
  col += orange * pow(max(n2, 0.0), 4.0) * 0.2;
  col += cream * (0.08 / (0.08 + length(uv))) * 0.12;

  float vig = smoothstep(1.38, 0.22, length(uv * vec2(0.92, 1.08)));
  col *= vig * uIntensity;
  col += vec3((hash21(gl_FragCoord.xy + fract(uTime) * 47.0) - 0.5) * 0.03);
  fragColor = vec4(col, 1.0);
}
`;

export function isWebGPUSupported(): boolean {
  if (typeof navigator === "undefined") return false;
  return Boolean((navigator as GpuNavigator).gpu);
}

let liveBackend: ShaderBackend | null = null;
const backendListeners = new Set<(backend: ShaderBackend) => void>();

function publishBackend(backend: ShaderBackend) {
  liveBackend = backend;
  backendListeners.forEach((listener) => listener(backend));
}

export function subscribeShaderBackend(listener: (backend: ShaderBackend) => void) {
  backendListeners.add(listener);
  if (liveBackend) listener(liveBackend);
  return () => {
    backendListeners.delete(listener);
  };
}

export function getShaderBackend() {
  return liveBackend;
}

function isMobileViewport() {
  return window.matchMedia("(max-width: 768px)").matches;
}

function frameBudget() {
  return isMobileViewport() ? 33 : 16;
}

function readSize(canvas: HTMLCanvasElement) {
  const parent = canvas.parentElement ?? canvas;
  const rect = parent.getBoundingClientRect();
  const mobile = isMobileViewport();
  const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 2);
  const scale = mobile ? 0.72 : 1;
  const width = Math.max(1, Math.floor(rect.width * dpr * scale));
  const height = Math.max(1, Math.floor(rect.height * dpr * scale));
  return { width, height, cssW: rect.width, cssH: rect.height };
}

function attachPointer(target: { x: number; y: number }) {
  const onMove = (event: PointerEvent) => {
    const w = window.innerWidth || 1;
    const h = window.innerHeight || 1;
    target.x = event.clientX / w;
    target.y = event.clientY / h;
  };
  window.addEventListener("pointermove", onMove, { passive: true });
  return () => window.removeEventListener("pointermove", onMove);
}

function startCanvas2D(
  canvas: HTMLCanvasElement,
  options: { frozen: boolean; intensity: number },
): StopHandle {
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) return { destroy() {} };

  const pointer = { x: 0.5, y: 0.5 };
  const cursor = { x: 0.5, y: 0.5 };
  const started = performance.now();
  let raf = 0;
  let last = 0;
  let running = true;
  const detach = attachPointer(pointer);

  const resize = () => {
    const size = readSize(canvas);
    canvas.width = size.width;
    canvas.height = size.height;
  };

  const paint = (now: number) => {
    const w = canvas.width;
    const h = canvas.height;
    const t = options.frozen ? 0.8 : (now - started) / 1000;
    cursor.x += (pointer.x - cursor.x) * 0.06;
    cursor.y += (pointer.y - cursor.y) * 0.06;
    const k = options.intensity;

    ctx.fillStyle = "#050506";
    ctx.fillRect(0, 0, w, h);

    const cx = w * 0.5 + (cursor.x - 0.5) * w * 0.16;
    const cy = h * 0.42 + (cursor.y - 0.5) * h * 0.12;
    const radius = Math.max(w, h) * 0.7;

    const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    core.addColorStop(0, `rgba(171,224,84,${0.18 * k})`);
    core.addColorStop(0.38, `rgba(250,85,60,${0.1 * k})`);
    core.addColorStop(1, "rgba(5,5,6,0)");
    ctx.fillStyle = core;
    ctx.fillRect(0, 0, w, h);

    ctx.lineWidth = Math.max(8, h * 0.045);
    ctx.lineCap = "round";
    for (let i = 0; i < 5; i += 1) {
      ctx.beginPath();
      ctx.strokeStyle = i % 2 === 0 ? `rgba(171,224,84,${0.1 * k})` : `rgba(250,85,60,${0.08 * k})`;
      const mid = h * (0.22 + i * 0.14);
      for (let x = 0; x <= w; x += 10) {
        const nx = x / w;
        const y =
          mid +
          Math.sin(nx * 4.2 + t * 0.7 + i) * h * 0.05 +
          Math.sin(nx * 9.0 - t * 0.4 + i * 1.4) * h * 0.018;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  };

  const loop = (now: number) => {
    if (!running) return;
    if (document.hidden) {
      raf = window.requestAnimationFrame(loop);
      return;
    }
    if (now - last >= frameBudget()) {
      last = now;
      paint(now);
    }
    if (!options.frozen) raf = window.requestAnimationFrame(loop);
  };

  resize();
  paint(started);
  const observer = new ResizeObserver(() => {
    resize();
    paint(performance.now());
  });
  observer.observe(canvas.parentElement ?? canvas);
  if (!options.frozen) raf = window.requestAnimationFrame(loop);

  return {
    destroy() {
      running = false;
      window.cancelAnimationFrame(raf);
      observer.disconnect();
      detach();
    },
  };
}

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function startWebGL2(canvas: HTMLCanvasElement, intensity: number): StopHandle | null {
  const gl = canvas.getContext("webgl2", {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "high-performance",
  });
  if (!gl) return null;

  const vs = compile(gl, gl.VERTEX_SHADER, VERT_GLSL);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG_GLSL);
  if (!vs || !fs) return null;

  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  gl.useProgram(program);

  const locRes = gl.getUniformLocation(program, "uResolution");
  const locTime = gl.getUniformLocation(program, "uTime");
  const locPointer = gl.getUniformLocation(program, "uPointer");
  const locQuality = gl.getUniformLocation(program, "uQuality");
  const locIntensity = gl.getUniformLocation(program, "uIntensity");

  const pointer = { x: 0.5, y: 0.5 };
  const cursor = { x: 0.5, y: 0.5 };
  const started = performance.now();
  const quality = isMobileViewport() ? 0 : 1;
  let raf = 0;
  let last = 0;
  let running = true;
  const detach = attachPointer(pointer);

  const resize = () => {
    const size = readSize(canvas);
    canvas.width = size.width;
    canvas.height = size.height;
    gl.viewport(0, 0, size.width, size.height);
  };

  const loop = (now: number) => {
    if (!running) return;
    if (!document.hidden && now - last >= frameBudget()) {
      last = now;
      cursor.x += (pointer.x - cursor.x) * 0.06;
      cursor.y += (pointer.y - cursor.y) * 0.06;
      gl.uniform2f(locRes, canvas.width, canvas.height);
      gl.uniform1f(locTime, (now - started) / 1000);
      gl.uniform2f(locPointer, cursor.x, 1 - cursor.y);
      gl.uniform1f(locQuality, quality);
      gl.uniform1f(locIntensity, intensity);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    raf = window.requestAnimationFrame(loop);
  };

  resize();
  const observer = new ResizeObserver(resize);
  observer.observe(canvas.parentElement ?? canvas);
  raf = window.requestAnimationFrame(loop);

  return {
    destroy() {
      running = false;
      window.cancelAnimationFrame(raf);
      observer.disconnect();
      detach();
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteVertexArray(vao);
      const lose = gl.getExtension("WEBGL_lose_context");
      lose?.loseContext();
    },
  };
}

async function startWebGPU(
  canvas: HTMLCanvasElement,
  intensity: number,
): Promise<StopHandle | null> {
  const gpu = (navigator as GpuNavigator).gpu;
  if (!gpu) return null;

  const adapter = await gpu.requestAdapter();
  if (!adapter) return null;
  const device = await adapter.requestDevice();
  const context = (
    canvas.getContext as (id: string) => {
      configure: (desc: unknown) => void;
      getCurrentTexture: () => { createView: () => unknown };
    } | null
  )("webgpu");
  if (!context) {
    device.destroy?.();
    return null;
  }

  const format = gpu.getPreferredCanvasFormat();
  const module = device.createShaderModule({ code: WGSL });
  const pipeline = device.createRenderPipeline({
    layout: "auto",
    vertex: { module, entryPoint: "vs" },
    fragment: {
      module,
      entryPoint: "fs",
      targets: [{ format }],
    },
    primitive: { topology: "triangle-list" },
  });

  const uniformData = new Float32Array(8);
  const uniformBuffer = device.createBuffer({
    size: uniformData.byteLength,
    usage: 0x40 | 0x8,
  });
  const bindGroup = device.createBindGroup({
    layout: (pipeline as { getBindGroupLayout: (i: number) => unknown }).getBindGroupLayout(0),
    entries: [{ binding: 0, resource: { buffer: uniformBuffer } }],
  });

  const pointer = { x: 0.5, y: 0.5 };
  const cursor = { x: 0.5, y: 0.5 };
  const started = performance.now();
  const quality = isMobileViewport() ? 0 : 1;
  let raf = 0;
  let last = 0;
  let running = true;
  const detach = attachPointer(pointer);

  const configure = () => {
    const size = readSize(canvas);
    canvas.width = size.width;
    canvas.height = size.height;
    context.configure({
      device,
      format,
      alphaMode: "opaque",
    });
  };

  const loop = (now: number) => {
    if (!running) return;
    if (!document.hidden && now - last >= frameBudget()) {
      last = now;
      cursor.x += (pointer.x - cursor.x) * 0.06;
      cursor.y += (pointer.y - cursor.y) * 0.06;
      uniformData[0] = canvas.width;
      uniformData[1] = canvas.height;
      uniformData[2] = (now - started) / 1000;
      uniformData[3] = quality;
      uniformData[4] = cursor.x;
      uniformData[5] = 1 - cursor.y;
      uniformData[6] = intensity;
      uniformData[7] = 0;
      device.queue.writeBuffer(uniformBuffer, 0, uniformData);

      const encoder = device.createCommandEncoder();
      const pass = encoder.beginRenderPass({
        colorAttachments: [
          {
            view: context.getCurrentTexture().createView(),
            loadOp: "clear",
            storeOp: "store",
            clearValue: { r: 0.02, g: 0.02, b: 0.024, a: 1 },
          },
        ],
      });
      pass.setPipeline(pipeline);
      pass.setBindGroup(0, bindGroup);
      pass.draw(3);
      pass.end();
      device.queue.submit([encoder.finish()]);
    }
    raf = window.requestAnimationFrame(loop);
  };

  configure();
  const observer = new ResizeObserver(configure);
  observer.observe(canvas.parentElement ?? canvas);
  raf = window.requestAnimationFrame(loop);

  return {
    destroy() {
      running = false;
      window.cancelAnimationFrame(raf);
      observer.disconnect();
      detach();
      uniformBuffer.destroy();
      device.destroy?.();
    },
  };
}

export function startShaderEngine(
  canvas: HTMLCanvasElement,
  options: ShaderEngineOptions = {},
): StopHandle {
  const intensity = options.intensity ?? 1;
  let current: StopHandle | null = null;
  let cancelled = false;

  if (options.reducedMotion) {
    current = startCanvas2D(canvas, { frozen: true, intensity });
    publishBackend("canvas2d");
    options.onBackend?.("canvas2d");
    return {
      destroy() {
        cancelled = true;
        current?.destroy();
      },
    };
  }

  const boot = async () => {
    if (isWebGPUSupported()) {
      try {
        const gpu = await startWebGPU(canvas, intensity);
        if (cancelled) {
          gpu?.destroy();
          return;
        }
        if (gpu) {
          current = gpu;
          publishBackend("webgpu");
          options.onBackend?.("webgpu");
          return;
        }
      } catch {
        current = null;
      }
    }

    if (cancelled) return;
    const gl = startWebGL2(canvas, intensity);
    if (gl) {
      current = gl;
      publishBackend("webgl2");
      options.onBackend?.("webgl2");
      return;
    }

    current = startCanvas2D(canvas, { frozen: false, intensity });
    publishBackend("canvas2d");
    options.onBackend?.("canvas2d");
  };

  void boot();

  return {
    destroy() {
      cancelled = true;
      current?.destroy();
    },
  };
}
