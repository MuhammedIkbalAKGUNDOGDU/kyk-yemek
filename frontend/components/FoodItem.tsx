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
          <span>Beğen</span>
          <span className="ml-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
            {likes}
          </span>
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
          <span>Beğenme</span>
          <span className="ml-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
            {dislikes}
          </span>
        </button>
      </div>
    </div>
  );
}
