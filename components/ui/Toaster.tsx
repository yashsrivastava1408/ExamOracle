"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, createContext, useContext } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToasterContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToasterContext = createContext<ToasterContextType | undefined>(undefined);

export function useToaster() {
  const context = useContext(ToasterContext);
  if (!context) {
    throw new Error("useToaster must be used within a ToasterProvider");
  }
  return context;
}

export function ToasterProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = (message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToasterContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="pointer-auto flex w-full max-w-sm items-center gap-3 rounded-[20px] border border-white/[0.08] bg-[#0d1520]/80 p-4 shadow-2xl backdrop-blur-xl pointer-events-auto"
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                t.type === "success" ? "bg-emerald-500/10 text-emerald-400" :
                t.type === "error" ? "bg-rose-500/10 text-rose-400" :
                t.type === "warning" ? "bg-amber-500/10 text-amber-400" :
                "bg-indigo-500/10 text-indigo-400"
              }`}>
                {t.type === "success" && <CheckCircle2 className="h-5 w-5" />}
                {t.type === "error" && <XCircle className="h-5 w-5" />}
                {t.type === "warning" && <AlertTriangle className="h-5 w-5" />}
                {t.type === "info" && <Info className="h-5 w-5" />}
              </div>
              <p className="flex-1 text-sm font-medium text-white/90">{t.message}</p>
              <button
                onClick={() => removeToast(t.id)}
                className="rounded-full p-1 text-white/20 hover:bg-white/5 hover:text-white/50 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
              <AutoRemove onRemove={() => removeToast(t.id)} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToasterContext.Provider>
  );
}

function AutoRemove({ onRemove }: { onRemove: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onRemove, 5000);
    return () => clearTimeout(timer);
  }, [onRemove]);
  return null;
}
