"use client";

import { useState, useEffect } from "react";
import { MessageSquare } from "lucide-react";
import { FoodItem } from "./FoodItem";
import { CommentModal } from "./CommentModal";
import { getCommentCount } from "@/lib/publicApi";

interface FoodItemData {
  id: string;
  name: string;
  likes: number;
  dislikes: number;
}

interface MenuCardProps {
  menuId: string;
  title: string;
  items: FoodItemData[];
  totalCalories: number;
}

export function MenuCard({ menuId, title, items, totalCalories }: MenuCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [commentCount, setCommentCount] = useState(0);

  // Yorum sayısını çek
  useEffect(() => {
    if (menuId) {
      getCommentCount(menuId).then(setCommentCount).catch(() => setCommentCount(0));
    }
  }, [menuId]);

  // Modal kapandığında yorum sayısını güncelle
  const handleModalClose = () => {
    setIsModalOpen(false);
    // Yorum sayısını yeniden çek
    if (menuId) {
      getCommentCount(menuId).then(setCommentCount).catch(() => {});
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm sm:p-10">
        {/* Title */}
        <h3 className="mb-6 text-2xl font-bold text-gray-900">{title}</h3>

        {/* Food Items List - Vertical with inner padding */}
        <div className="mb-8 rounded-xl bg-gray-50 px-6 py-2">
          <div className="divide-y divide-gray-200">
            {items.map((item) => (
              <FoodItem 
                key={item.id} 
                name={item.name}
                initialLikes={item.likes}
                initialDislikes={item.dislikes}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          {/* Total Calories */}
          <p className="text-base text-gray-600">
            Ortalama Kalori: <span className="font-semibold text-gray-900">{totalCalories} kcal</span>
          </p>

          {/* Comment Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-3 rounded-full bg-green-500 px-8 py-4 text-base font-medium text-white transition-colors hover:bg-green-600"
          >
            <MessageSquare className="h-5 w-5" />
            <span>Yorumlar</span>
            <span className="ml-1 rounded-full bg-white/20 px-3 py-1 text-sm font-semibold">
              {commentCount}
            </span>
          </button>
        </div>
      </div>

      {/* Comment Modal */}
      <CommentModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        menuTitle={title}
        menuId={menuId}
      />
    </>
  );
}
