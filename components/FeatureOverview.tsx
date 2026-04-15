"use client";

import { useState } from "react";
import { LucideIcon, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface FeatureOverviewItem {
    key: string;
    title: string;
    description: string;
    value: string;
    eyebrow: string;
    icon: LucideIcon;
    accentClass: string;
    onClick?: () => void;
}

interface FeatureOverviewProps {
    heading: string;
    subheading: string;
    items: FeatureOverviewItem[];
}

export default function FeatureOverview({
    heading,
    subheading,
    items,
}: FeatureOverviewProps) {
    const [openKey, setOpenKey] = useState(items[0]?.key ?? "");

    return (
        <section className="flex flex-col gap-4">
            <div className="px-2">
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white/70">
                    {heading}
                </h2>
                <p className="mt-1 text-[11px] leading-relaxed text-white/30 font-medium">
                    {subheading}
                </p>
            </div>

            <div className="overflow-hidden rounded-[24px] border border-white/5 bg-white/[0.015] shadow-lg backdrop-blur-md">
                {items.map((item, index) => {
                    const Icon = item.icon;
                    const isOpen = openKey === item.key;

                    return (
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.08, duration: 0.4, ease: "easeOut" }}
                            key={item.key}
                            className={index !== items.length - 1 ? "border-b border-white/[0.06]" : ""}
                        >
                            <button
                                type="button"
                                onClick={() =>
                                    setOpenKey((current) =>
                                        current === item.key ? "" : item.key
                                    )
                                }
                                className={`group flex w-full items-center gap-3 px-3 py-3.5 text-left transition-colors hover:bg-white/[0.03] ${isOpen ? "bg-white/[0.02]" : ""}`}
                            >
                                <div
                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border border-white/10 bg-black/40 shadow-inner group-hover:scale-105 transition-transform ${item.accentClass}`}
                                >
                                    <Icon className="h-4 w-4 text-white" />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/20">
                                            {item.eyebrow}
                                        </div>
                                    </div>
                                    <div className="mt-0.5 text-sm font-semibold text-white/90">
                                        {item.title}
                                    </div>
                                </div>

                                <ChevronDown
                                    className={`h-4 w-4 shrink-0 text-white/35 transition-transform ${isOpen ? "rotate-180" : ""}`}
                                />
                            </button>

                            <AnimatePresence initial={false}>
                                {isOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-3 pb-4 pl-[3.75rem]">
                                            <p className="text-xs leading-relaxed text-white/40">
                                                {item.description}
                                            </p>
                                            {item.onClick && (
                                                <button
                                                    type="button"
                                                    onClick={item.onClick}
                                                    className="mt-3 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.15em] text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                                                >
                                                    Deploy Unit
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>
        </section>
    );
}
