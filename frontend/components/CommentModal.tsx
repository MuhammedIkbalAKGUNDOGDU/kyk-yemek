"use client";

import { useState, useEffect } from "react";
import { Send, User, Trash2, Loader2, LogIn } from "lucide-react";
import { Modal } from "./Modal";
import { getCommentsByMenuId, addComment, deleteComment, CommentData } from "@/lib/publicApi";
import { useRouter } from "next/navigation";

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuTitle: string;
  menuId: string | null;
}

// Avatar emojileri
const avatarEmojis: Record<string, string> = {
  avatar1: "😊",
  avatar2: "😎",
  avatar3: "🤓",
  avatar4: "😇",
  avatar5: "🥳",
  avatar6: "😋",
  avatar7: "🤗",
  avatar8: "😺",
};

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

  if (diffInHours < 1) return "Az önce";
  if (diffInHours < 24) return `${diffInHours} saat önce`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "Dün";
  if (diffInDays < 30) return `${diffInDays} gün önce`;
  return date.toLocaleDateString("tr-TR");
}

export function CommentModal({ isOpen, onClose, menuTitle, menuId }: CommentModalProps) {
  const router = useRouter();
  const [comments, setComments] = useState<CommentData[]>([]);
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Kullanıcı bilgisi
  const [currentUser, setCurrentUser] = useState<{ nickname: string } | null>(null);

  // Giriş durumu ve kullanıcı bilgisini kontrol et
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setCurrentUser(user);
        } catch {
          setCurrentUser(null);
        }
      }
    }
  }, [isOpen]);

  // Yorumları çek
  useEffect(() => {
    if (isOpen && menuId) {
      const fetchComments = async () => {
        setIsLoading(true);
        try {
          const data = await getCommentsByMenuId(menuId);
          setComments(data);
        } catch (err) {
          console.error('Yorumlar çekilemedi:', err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchComments();
    }
  }, [isOpen, menuId]);

  // Sadece harf, sayı ve temel noktalama işaretleri kontrolü
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const regex = /^[a-zA-ZğüşıöçĞÜŞİÖÇ0-9\s.,!?()-]*$/;
    
    if (regex.test(value)) {
      setNewComment(value);
      setError("");
    } else {
      setError("Sadece harf, sayı ve temel noktalama işaretleri girebilirsiniz");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Giriş kontrolü
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      if (confirm('Yorum yapmak için giriş yapmalısınız. Giriş sayfasına gitmek ister misiniz?')) {
        router.push('/login');
      }
      return;
    }

    if (!newComment.trim() || !menuId) return;
    
    setIsSubmitting(true);
    setError("");

    try {
      const comment = await addComment(menuId, newComment.trim());
      setComments(prev => [comment, ...prev]);
      setNewComment("");
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Yorum eklenemedi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Bu yorumu silmek istediğinize emin misiniz?')) return;
    
    setDeletingId(commentId);
    try {
      await deleteComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Yorum silinemedi');
    } finally {
      setDeletingId(null);
    }
  };

  const isLoggedIn = typeof window !== 'undefined' && !!localStorage.getItem('token');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${menuTitle} - Yorumlar`}>
      <div className="p-6">
        {/* Menü ID yoksa uyarı */}
        {!menuId && (
          <div className="text-center py-8">
            <p className="text-gray-500">Bu menü için yorum yapılamıyor.</p>
          </div>
        )}

        {/* Yorum Listesi */}
        {menuId && (
          <>
            <div className="mb-6 max-h-[400px] overflow-y-auto space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-green-500" />
                </div>
              ) : comments.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Henüz yorum yapılmamış. İlk yorumu sen yap!
                </p>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="flex gap-4 rounded-xl bg-gray-50 p-4 group"
                  >
                    {/* Avatar */}
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-emerald-100 text-xl">
                      {avatarEmojis[comment.avatarId] || "😊"}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900">
                            {comment.author}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatTimeAgo(comment.createdAt)}
                          </span>
                        </div>
                        
                        {/* Silme butonu (sadece kendi yorumu için) */}
                        {currentUser?.nickname === comment.author && (
                          <button
                            onClick={() => handleDelete(comment.id)}
                            disabled={deletingId === comment.id}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-50"
                            title="Yorumu sil"
                          >
                            {deletingId === comment.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {comment.text}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Giriş yapılmamışsa uyarı */}
            {!isLoggedIn && (
              <div className="border-t border-gray-100 pt-6">
                <div className="flex items-center justify-center gap-3 py-4 px-6 bg-amber-50 rounded-xl">
                  <LogIn className="h-5 w-5 text-amber-600" />
                  <p className="text-sm text-amber-700">
                    Yorum yapmak için{" "}
                    <button 
                      onClick={() => router.push('/login')}
                      className="font-semibold underline hover:no-underline"
                    >
                      giriş yapın
                    </button>
                  </p>
                </div>
              </div>
            )}

            {/* Yorum Ekleme Formu */}
            {isLoggedIn && (
              <form onSubmit={handleSubmit} className="border-t border-gray-100 pt-6">
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-emerald-100 text-xl">
                    {currentUser ? avatarEmojis[currentUser.nickname] || "😊" : "😊"}
                  </div>
                  <div className="flex-1">
                    <div className="relative">
                      <input
                        type="text"
                        value={newComment}
                        onChange={handleInputChange}
                        placeholder="Yorumunuzu yazın..."
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-14 text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:border-green-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-100"
                        maxLength={200}
                        disabled={isSubmitting}
                      />
                      <button
                        type="submit"
                        disabled={!newComment.trim() || isSubmitting}
                        className="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-lg bg-green-500 text-white transition-all hover:bg-green-600 disabled:bg-gray-200 disabled:text-gray-400"
                      >
                        {isSubmitting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
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
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
