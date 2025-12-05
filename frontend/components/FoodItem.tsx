"use client";

import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getFoodStats, likeFood, dislikeFood, getUserVote } from "@/lib/publicApi";
import { useRouter } from "next/navigation";

interface FoodItemProps {
  name: string;
  initialLikes?: number;
  initialDislikes?: number;
}

export function FoodItem({ name, initialLikes = 0, initialDislikes = 0 }: FoodItemProps) {
  const router = useRouter();
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [userVote, setUserVote] = useState<"like" | "dislike" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Sayfa yüklendiğinde beğeni bilgilerini çek
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Yemek istatistiklerini çek
        const stats = await getFoodStats(name);
        setLikes(stats.likes);
        setDislikes(stats.dislikes);

        // Kullanıcı oyunu çek (giriş yapmışsa)
        const vote = await getUserVote(name);
        if (vote === 'like' || vote === 'dislike') {
          setUserVote(vote);
        }
      } catch (err) {
        console.error('Yemek bilgisi çekme hatası:', err);
      } finally {
        setIsInitialized(true);
      }
    };

    fetchData();
  }, [name]);

  const handleLike = async () => {
    // Giriş yapılmış mı kontrol et
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      if (confirm('Beğenmek için giriş yapmalısınız. Giriş sayfasına gitmek ister misiniz?')) {
        router.push('/login');
      }
      return;
    }

    if (isLoading) return;
    setIsLoading(true);

    try {
      const result = await likeFood(name);
      setLikes(result.likes);
      setDislikes(result.dislikes);
      setUserVote(result.userVote as "like" | "dislike" | null);
    } catch (err) {
      console.error('Beğeni hatası:', err);
      alert(err instanceof Error ? err.message : 'Beğeni işlemi başarısız');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDislike = async () => {
    // Giriş yapılmış mı kontrol et
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      if (confirm('Oy vermek için giriş yapmalısınız. Giriş sayfasına gitmek ister misiniz?')) {
        router.push('/login');
      }
      return;
    }

    if (isLoading) return;
    setIsLoading(true);

    try {
      const result = await dislikeFood(name);
      setLikes(result.likes);
      setDislikes(result.dislikes);
      setUserVote(result.userVote as "like" | "dislike" | null);
    } catch (err) {
      console.error('Beğenmeme hatası:', err);
      alert(err instanceof Error ? err.message : 'Beğenmeme işlemi başarısız');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
      {/* Food Name */}
      <span className="text-sm font-medium text-gray-900 sm:text-base">{name}</span>

      {/* Vote Buttons */}
      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={handleLike}
          disabled={isLoading}
          className={cn(
            "flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium transition-all sm:gap-2 sm:px-4 sm:py-2 sm:text-sm disabled:opacity-50",
            userVote === "like"
              ? "border-green-500 bg-green-50 text-green-600"
              : "border-gray-300 bg-white text-gray-600 hover:border-green-300 hover:bg-green-50"
          )}
        >
          {isLoading ? (
            <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
          ) : (
            <ThumbsUp className="h-3 w-3 sm:h-4 sm:w-4" />
          )}
          <span className="hidden xs:inline sm:inline">Beğen</span>
          <span className={cn(
            "rounded-full px-1.5 py-0.5 text-[10px] font-semibold sm:ml-1 sm:px-2 sm:text-xs",
            userVote === "like" 
              ? "bg-green-200 text-green-800" 
              : "bg-green-100 text-green-700"
          )}>
            {isInitialized ? likes : '...'}
          </span>
        </button>
        <button
          onClick={handleDislike}
          disabled={isLoading}
          className={cn(
            "flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium transition-all sm:gap-2 sm:px-4 sm:py-2 sm:text-sm disabled:opacity-50",
            userVote === "dislike"
              ? "border-red-500 bg-red-50 text-red-600"
              : "border-gray-300 bg-white text-gray-600 hover:border-red-300 hover:bg-red-50"
          )}
        >
          {isLoading ? (
            <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
          ) : (
            <ThumbsDown className="h-3 w-3 sm:h-4 sm:w-4" />
          )}
          <span className="hidden xs:inline sm:inline">Beğenme</span>
          <span className={cn(
            "rounded-full px-1.5 py-0.5 text-[10px] font-semibold sm:ml-1 sm:px-2 sm:text-xs",
            userVote === "dislike" 
              ? "bg-red-200 text-red-800" 
              : "bg-red-100 text-red-700"
          )}>
            {isInitialized ? dislikes : '...'}
          </span>
        </button>
      </div>
    </div>
  );
}
