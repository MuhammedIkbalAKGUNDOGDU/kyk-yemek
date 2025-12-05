"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { FoodItem } from "./FoodItem";
import { CommentModal } from "./CommentModal";
import type { Menu, Comment } from "@/data/menus";

interface MenuCardProps {
  menu: Menu;
}

export function MenuCard({ menu }: MenuCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>(menu.comments);

  const handleAddComment = (text: string) => {
    const newComment: Comment = {
      id: `new-${Date.now()}`,
      author: "Misafir",
      text,
      timestamp: new Date(),
    };
    setComments((prev) => [...prev, newComment]);
  };

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm sm:p-10">
        {/* Title */}
        <h3 className="mb-6 text-2xl font-bold text-gray-900">{menu.title}</h3>

        {/* Food Items List - Vertical with inner padding */}
        <div className="mb-8 rounded-xl bg-gray-50 px-6 py-2">
          <div className="divide-y divide-gray-200">
            {menu.items.map((item) => (
              <FoodItem key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          {/* Total Calories */}
          <p className="text-base text-gray-600">
            Ortalama Kalori: <span className="font-semibold text-gray-900">{menu.totalCalories} kcal</span>
          </p>

          {/* Comment Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-3 rounded-full bg-green-500 px-8 py-4 text-base font-medium text-white transition-colors hover:bg-green-600"
          >
            <MessageSquare className="h-5 w-5" />
            <span>Yorumlar</span>
            <span className="ml-1 rounded-full bg-white/20 px-3 py-1 text-sm font-semibold">
              {comments.length}
            </span>
          </button>
        </div>
      </div>

      {/* Comment Modal */}
      <CommentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        menuTitle={menu.title}
        comments={comments}
        onAddComment={handleAddComment}
      />
    </>
  );
}
