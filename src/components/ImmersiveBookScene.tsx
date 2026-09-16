import { useEffect, useRef } from "react";

import cover from "@/assets/book-cover.svg";

export function ImmersiveBookScene() {
  const coatingRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = coatingRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio, 2);
      canvas.width = bounds.width * pixelRatio;
      canvas.height = bounds.height * pixelRatio;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      const coating = context.createLinearGradient(0, 0, bounds.width, bounds.height);
      coating.addColorStop(0, "#8b8881");
      coating.addColorStop(0.48, "#383a39");
      coating.addColorStop(1, "#68645d");
      context.fillStyle = coating;
      context.fillRect(0, 0, bounds.width, bounds.height);

      context.globalAlpha = 0.18;
      context.strokeStyle = "#f7f3e8";
      context.lineWidth = 1;
      for (let index = -bounds.height; index < bounds.width + bounds.height; index += 7) {
        context.beginPath();
        context.moveTo(index, 0);
        context.lineTo(index - bounds.height * 0.35, bounds.height);
        context.stroke();
      }
      context.globalAlpha = 1;
    };

    const scratch = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      const radius = 32 + Math.random() * 14;

      context.save();
      context.globalCompositeOperation = "destination-out";
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
      context.restore();
    };

    resize();
    canvas.addEventListener("pointerdown", scratch);
    canvas.addEventListener("pointermove", scratch);
    window.addEventListener("resize", resize);
    return () => {
      canvas.removeEventListener("pointerdown", scratch);
      canvas.removeEventListener("pointermove", scratch);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div
      className="scratch-book"
    >
      <div className="scratch-book-light" aria-hidden="true" />
      <img
        className="scratch-book-cover"
        src={cover}
        alt="Capa do livro Tramas Ocultas: Vozes da Vida"
        width={1024}
        height={1536}
      />
      <canvas ref={coatingRef} className="scratch-book-coating" aria-hidden="true" />
      <div className="scratch-book-instruction" aria-hidden="true">
        <span /> Aproxime o olhar · passe o mouse para revelar
      </div>
    </div>
  );
}
