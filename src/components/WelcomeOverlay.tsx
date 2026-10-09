import { useQuery } from "@tanstack/react-query";
import { useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

import { detectDevice, deviceZoom, type DetectedDevice } from "@/lib/device";
import { firstNameOf, sessionQuery } from "@/lib/session";

type Phase = "show" | "zoom";

function clearWelcomeParam() {
  const url = new URL(window.location.href);
  url.searchParams.delete("welcome");
  window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
}

function AppleMark({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 20" className={`${className} fill-current`} aria-hidden>
      <path d="M13.3 10.6c0-2.1 1.7-3.1 1.8-3.2-1-1.5-2.5-1.7-3.1-1.7-1.3-.1-2.6.8-3.2.8s-1.7-.8-2.8-.7c-1.4 0-2.8.9-3.5 2.2-1.5 2.6-.4 6.5 1.1 8.6.7 1 1.6 2.2 2.7 2.1 1.1-.1 1.5-.7 2.8-.7s1.6.7 2.8.7c1.2 0 1.9-1 2.7-2.1.8-1.2 1.2-2.4 1.2-2.4s-2.1-.8-2.1-3.6z" />
      <path d="M11.1 4.3c.6-.7 1-1.7.9-2.7-1 .1-2.1.7-2.7 1.5-.6.7-1.1 1.7-.9 2.6 1 0 2-.6 2.7-1.4z" />
    </svg>
  );
}

function WelcomeCopy({ name }: { name: string }) {
  return (
    <div className="studio-copy">
      <motion.p
        initial={{ opacity: 0, letterSpacing: "0.5em" }}
        animate={{ opacity: 1, letterSpacing: "0.28em" }}
        transition={{ duration: 1.1, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="studio-kicker"
      >
        Tramas Ocultas
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 18, filter: "blur(12px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 1, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="studio-title"
      >
        Seja bem-vindo, {name}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 1.35, ease: [0.22, 1, 0.36, 1] }}
        className="studio-line"
      >
        Está pronto para esta viagem em Tramas Ocultas?
      </motion.p>
    </div>
  );
}

function DeviceFrame({ device, name }: { device: DetectedDevice; name: string }) {
  if (device.kind === "iphone") {
    return (
      <div className="device-phone">
        <span className="device-btn device-btn-silent" />
        <span className="device-btn device-btn-vol" />
        <span className="device-btn device-btn-power" />
        <div className="device-phone-screen">
          <span className="device-island" />
          <WelcomeCopy name={name} />
          <span className="device-home" />
        </div>
      </div>
    );
  }

  if (device.kind === "android-phone") {
    return (
      <div className="device-phone device-android">
        <span className="device-btn device-btn-vol" />
        <span className="device-btn device-btn-power" />
        <div className="device-phone-screen">
          <span className="device-punch" />
          <WelcomeCopy name={name} />
          <span className="device-home" />
        </div>
      </div>
    );
  }

  if (device.kind === "ipad" || device.kind === "android-tablet") {
    return (
      <div className={`device-tablet${device.kind === "android-tablet" ? " device-android" : ""}`}>
        <div className="device-tablet-screen">
          <span className="device-tablet-cam" />
          <WelcomeCopy name={name} />
        </div>
      </div>
    );
  }

  if (device.kind === "macbook") {
    return (
      <div className="device-laptop">
        <div className="device-laptop-lid">
          <div className="device-laptop-screen">
            <span className="device-laptop-notch">
              <AppleMark className="h-2.5 w-2.5" />
            </span>
            <WelcomeCopy name={name} />
          </div>
        </div>
        <div className="device-laptop-base">
          <span className="device-laptop-well" />
        </div>
      </div>
    );
  }

  return (
    <div className="studio-display">
      <div className="studio-chassis">
        <div className="studio-screen">
          <div className="studio-glass" />
          <WelcomeCopy name={name} />
        </div>
        <div className="studio-chin">{device.kind === "imac" ? <AppleMark /> : null}</div>
      </div>
      <div className="studio-neck" />
      <div className="studio-foot" />
    </div>
  );
}

export function WelcomeOverlay() {
  const search = useRouterState({ select: (state) => state.location.searchStr });
  const { data: user } = useQuery(sessionQuery());
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("show");
  const [device, setDevice] = useState<DetectedDevice>({ kind: "monitor", label: "Monitor" });

  useEffect(() => {
    setDevice(detectDevice());
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
    if (params.get("welcome") === "1" && user?.name) {
      setDevice(detectDevice());
      setPhase("show");
      setOpen(true);
    }
  }, [search, user?.name]);

  useEffect(() => {
    if (!open || phase !== "show") return;
    const timer = window.setTimeout(() => setPhase("zoom"), 4200);
    return () => window.clearTimeout(timer);
  }, [open, phase]);

  const close = () => {
    setOpen(false);
    setPhase("show");
    clearWelcomeParam();
  };

  const name = firstNameOf(user?.name);
  const zoom = deviceZoom(device.kind);

  return (
    <AnimatePresence>
      {open && (
        <motion.button
          key="studio-welcome"
          type="button"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
          className="studio-stage"
          onClick={() => (phase === "show" ? setPhase("zoom") : close())}
          aria-label={`Seja bem-vindo, ${name}`}
        >
          <div className="studio-room" />
          <motion.div
            className="studio-rig"
            initial={{ opacity: 0, y: 48, scale: 0.88, rotateX: 12 }}
            animate={
              phase === "zoom"
                ? { opacity: 1, y: 0, scale: zoom, rotateX: 0 }
                : { opacity: 1, y: 0, scale: 1, rotateX: 8 }
            }
            exit={{ opacity: 0, scale: zoom + 0.6, filter: "blur(18px)" }}
            transition={{ duration: phase === "zoom" ? 1.45 : 1.15, ease: [0.32, 0.72, 0, 1] }}
            onAnimationComplete={() => {
              if (phase === "zoom") close();
            }}
          >
            <DeviceFrame device={device} name={name} />
            <p className="device-caption">{device.label}</p>
          </motion.div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
