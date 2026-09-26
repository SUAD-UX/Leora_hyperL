import { cn } from "@/utils/cn";

/**
 * Ambient depth layer shared by the landing page and the app.
 * Slow warm light fields behind glass — candlelight, not neon.
 */
export function Backdrop({ variant = "app" }: { variant?: "app" | "landing" }) {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink-1000">
      <div
        className={cn(
          "animate-drift absolute -top-[28vh] -left-[12vw] h-[74vh] w-[70vw] rounded-full blur-[130px]",
          variant === "landing" ? "opacity-[0.46]" : "opacity-[0.3]",
        )}
        style={{
          background:
            "radial-gradient(circle at 40% 42%, rgba(199,157,93,0.34), rgba(166,126,69,0.10) 46%, transparent 72%)",
        }}
      />
      <div
        className="animate-drift absolute top-[6vh] right-[-20vw] h-[68vh] w-[66vw] rounded-full opacity-[0.3] blur-[140px]"
        style={{
          animationDelay: "-9s",
          background:
            "radial-gradient(circle at 50% 50%, rgba(220,184,124,0.26), rgba(124,92,49,0.08) 50%, transparent 74%)",
        }}
      />
      <div
        className="animate-drift absolute bottom-[-26vh] left-[16vw] h-[58vh] w-[64vw] rounded-full opacity-[0.22] blur-[150px]"
        style={{
          animationDelay: "-16s",
          background:
            "radial-gradient(circle at 50% 50%, rgba(139,163,191,0.2), transparent 70%)",
        }}
      />
      {/* horizon */}
      <div className="absolute inset-x-0 top-[52vh] h-px bg-gradient-to-r from-transparent via-gold-500/[0.14] to-transparent" />
      {/* fine grid */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(233,207,157,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(233,207,157,0.5) 1px, transparent 1px)",
          backgroundSize: "104px 104px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 28%, black, transparent 78%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 28%, black, transparent 78%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.15] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
