"use client";

import { motion } from "framer-motion";

interface SkeletonProps {
  className?: string;
  count?: number;
}

export default function SkeletonLoader({ className, count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0.3 }}
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`rounded-xl bg-white/[0.05] ${className}`}
        />
      ))}
    </>
  );
}

export function PostCardSkeleton() {
  return (
    <div className="rounded-[24px] border border-white/[0.04] bg-white/[0.02] p-6 backdrop-blur-md">
      <div className="mb-5 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <SkeletonLoader className="h-10 w-10 rounded-2xl" />
          <div className="space-y-2">
            <SkeletonLoader className="h-4 w-24 rounded-md" />
            <SkeletonLoader className="h-3 w-16 rounded-md" />
          </div>
        </div>
        <SkeletonLoader className="h-6 w-20 rounded-full" />
      </div>
      <div className="mb-4 space-y-3">
        <SkeletonLoader className="h-6 w-3/4 rounded-md" />
        <SkeletonLoader className="h-4 w-full rounded-md" />
        <SkeletonLoader className="h-4 w-5/6 rounded-md" />
      </div>
      <div className="flex gap-2">
        <SkeletonLoader className="h-8 w-20 rounded-full" />
        <SkeletonLoader className="h-8 w-24 rounded-full" />
      </div>
      <div className="mt-5 border-t border-white/[0.04] pt-5 flex justify-between">
        <SkeletonLoader className="h-10 w-24 rounded-full" />
        <SkeletonLoader className="h-10 w-16 rounded-full" />
      </div>
    </div>
  );
}
