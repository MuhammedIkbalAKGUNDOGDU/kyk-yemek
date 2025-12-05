"use client";

import { useState } from "react";
import { Send, User } from "lucide-react";
import { Modal } from "./Modal";
import type { Comment } from "@/data/menus";

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuTitle: string;
  comments: Comment[];
  onAddComment: (text: string) => void;
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

  if (diffInHours < 1) return "Az önce";
  if (diffInHours < 24) return `${diffInHours} saat önce`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "Dün";
  return `${diffInDays} gün önce`;
}

export function CommentModal({ isOpen, onClose, menuTitle, comments, onAddComment }: CommentModalProps) {
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState("");

  // Sadece harf ve sayı kontrolü
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Türkçe karakterler dahil harf, sayı ve boşluk
    const regex = /^[a-zA-ZğüşıöçĞÜŞİÖÇ0-9\s]*$/;
    
    if (regex.test(value)) {
      setNewComment(value);
      setError("");
    } else {
      setError("Sadece harf ve sayı girebilirsiniz");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment.trim());
      setNewComment("");
      setError("");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${menuTitle} - Yorumlar`}>
      <div className="p-6">
        {/* Yorum Listesi */}
        <div className="mb-6 space-y-4">
          {comments.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Henüz yorum yapılmamış. İlk yorumu sen yap!
            </p>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="flex gap-4 rounded-xl bg-gray-50 p-4"
              >
                {/* Avatar */}
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                  <User className="h-5 w-5 text-green-600" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-900">
                      {comment.author}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatTimeAgo(comment.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {comment.text}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Yorum Ekleme Formu */}
        <form onSubmit={handleSubmit} className="border-t border-gray-100 pt-6">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-100">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  value={newComment}
                  onChange={handleInputChange}
                  placeholder="Yorumunuzu yazın (sadece harf ve sayı)..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-14 text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:border-green-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-100"
                  maxLength={200}
                />
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-lg bg-green-500 text-white transition-all hover:bg-green-600 disabled:bg-gray-200 disabled:text-gray-400"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              {error && (
                <p className="mt-2 text-xs text-red-500">{error}</p>
              )}
              <p className="mt-2 text-xs text-gray-400">
                {newComment.length}/200 karakter
              </p>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}

