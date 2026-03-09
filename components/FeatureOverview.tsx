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
            <div className="max-w-2xl">
                <h2 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
                    {heading}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-white/45">
                    {subheading}
                </p>
            </div>

            <div className="overflow-hidden rounded-[1.5rem] border border-white/[0.08] bg-black/20">
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
                                className={`group flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-white/[0.04] ${isOpen ? "bg-white/[0.04]" : ""}`}
                            >
                                <div
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] ${item.accentClass}`}
                                >
                                    <Icon className="h-4 w-4 text-white" />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
                                            {item.eyebrow}
                                        </div>
                                        <div className="shrink-0 text-xs font-semibold text-white/55">
                                            {item.value}
                                        </div>
                                    </div>
                                    <div className="mt-1 text-sm font-semibold text-white sm:text-[15px]">
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
                                        <div className="px-4 pb-4 pl-[4.75rem]">
                                            <p className="text-sm leading-relaxed text-white/50">
                                                {item.description}
                                            </p>
                                            {item.onClick && (
                                                <button
                                                    type="button"
                                                    onClick={item.onClick}
                                                    className="mt-3 inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/65 transition-colors hover:bg-white/[0.08] hover:text-white"
                                                >
                                                    Use Feature
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
