import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Backdrop } from "@/components/Backdrop";
import { AppRoot } from "@/app/AppRoot";
import { Landing } from "@/landing/Landing";

type Route = "landing" | "app";

function currentRoute(): Route {
  return window.location.hash.replace("#", "").startsWith("app") ? "app" : "landing";
}

export default function App() {
  const [route, setRoute] = useState<Route>(() => currentRoute());

  useEffect(() => {
    const onHash = () => setRoute(currentRoute());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [route]);

  const go = useCallback((next: Route) => {
    window.location.hash = next === "app" ? "app" : "";
    setRoute(next);
  }, []);

  return (
    <>
      <Backdrop variant={route === "landing" ? "landing" : "app"} />
      <AnimatePresence mode="wait">
        <motion.div
          key={route}
          initial={{ opacity: 0, filter: "blur(6px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: "blur(6px)" }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          {route === "app" ? (
            <AppRoot onExit={() => go("landing")} />
          ) : (
            <Landing onLaunch={() => go("app")} />
          )}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
