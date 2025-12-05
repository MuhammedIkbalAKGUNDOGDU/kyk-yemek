"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FoodItem as FoodItemType } from "@/data/menus";

interface FoodItemProps {
  item: FoodItemType;
}

export function FoodItem({ item }: FoodItemProps) {
  const [likes, setLikes] = useState(item.likes);
  const [dislikes, setDislikes] = useState(item.dislikes);
  const [userVote, setUserVote] = useState<"like" | "dislike" | null>(null);

  const handleLike = () => {
    if (userVote === "like") {
      setLikes((prev) => prev - 1);
      setUserVote(null);
    } else {
      if (userVote === "dislike") {
        setDislikes((prev) => prev - 1);
      }
      setLikes((prev) => prev + 1);
      setUserVote("like");
    }
  };

  const handleDislike = () => {
    if (userVote === "dislike") {
      setDislikes((prev) => prev - 1);
      setUserVote(null);
    } else {
      if (userVote === "like") {
        setLikes((prev) => prev - 1);
      }
      setDislikes((prev) => prev + 1);
      setUserVote("dislike");
    }
  };

  return (
    <div className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
      {/* Food Name */}
      <span className="text-sm font-medium text-gray-900 sm:text-base">{item.name}</span>

      {/* Vote Buttons */}
      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={handleLike}
          className={cn(
            "flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium transition-all sm:gap-2 sm:px-4 sm:py-2 sm:text-sm",
            userVote === "like"
              ? "border-green-500 bg-green-50 text-green-600"
              : "border-gray-300 bg-white text-gray-600 hover:border-green-300 hover:bg-green-50"
          )}
        >
          <ThumbsUp className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden xs:inline sm:inline">Beğen</span>
          <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-semibold text-green-700 sm:ml-1 sm:px-2 sm:text-xs">
            {likes}
          </span>
        </button>
        <button
          onClick={handleDislike}
          className={cn(
            "flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium transition-all sm:gap-2 sm:px-4 sm:py-2 sm:text-sm",
            userVote === "dislike"
              ? "border-red-500 bg-red-50 text-red-600"
              : "border-gray-300 bg-white text-gray-600 hover:border-red-300 hover:bg-red-50"
          )}
        >
          <ThumbsDown className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden xs:inline sm:inline">Beğenme</span>
          <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-700 sm:ml-1 sm:px-2 sm:text-xs">
            {dislikes}
          </span>
        </button>
      </div>
    </div>
  );
}
