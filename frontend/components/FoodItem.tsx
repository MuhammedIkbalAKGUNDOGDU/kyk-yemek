"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FoodItem as FoodItemType } from "@/data/menus";

interface FoodItemProps {
  item: FoodItemType;
}

export function FoodItem({ item }: FoodItemProps) {
  const [userVote, setUserVote] = useState<"like" | "dislike" | null>(null);

  const handleLike = () => {
    setUserVote(userVote === "like" ? null : "like");
  };

  const handleDislike = () => {
    setUserVote(userVote === "dislike" ? null : "dislike");
  };

  return (
    <div className="flex items-center justify-between py-5">
      {/* Food Name */}
      <span className="text-base font-medium text-gray-900">{item.name}</span>

      {/* Vote Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleLike}
          className={cn(
            "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all",
            userVote === "like"
              ? "border-green-500 bg-green-50 text-green-600"
              : "border-gray-300 bg-white text-gray-600 hover:border-green-300 hover:bg-green-50"
          )}
        >
          <ThumbsUp className="h-4 w-4" />
          Beğen
        </button>
        <button
          onClick={handleDislike}
          className={cn(
            "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all",
            userVote === "dislike"
              ? "border-red-500 bg-red-50 text-red-600"
              : "border-gray-300 bg-white text-gray-600 hover:border-red-300 hover:bg-red-50"
          )}
        >
          <ThumbsDown className="h-4 w-4" />
          Beğenme
        </button>
      </div>
    </div>
  );
}
