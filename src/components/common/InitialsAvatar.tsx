"use client";
import React, { useMemo } from "react";

interface InitialsAvatarProps {
  name: string;
  size?: number;
  className?: string;
}

const colors = [
  "bg-red-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-yellow-500",
  "bg-lime-500",
  "bg-green-500",
  "bg-emerald-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-sky-500",
  "bg-blue-500",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-purple-500",
  "bg-fuchsia-500",
  "bg-pink-500",
  "bg-rose-500",
];

export default function InitialsAvatar({ name, size = 44, className = "" }: InitialsAvatarProps) {
  const { initials, colorClass } = useMemo(() => {
    const parts = name.trim().split(/\s+/);
    const initials = parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : name.slice(0, 2).toUpperCase();
    
    // Generate consistent color based on name
    const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colorClass = colors[hash % colors.length];
    
    return { initials, colorClass };
  }, [name]);

  return (
    <div
      className={`flex items-center justify-center rounded-full text-white font-semibold ${colorClass} ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials}
    </div>
  );
}

