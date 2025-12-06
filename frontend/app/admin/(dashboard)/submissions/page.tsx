"use client";

import { useState, useEffect } from "react";
import {
  Inbox,
  Eye,
  Check,
  X,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  User,
  Mail,
  FileText,
  Image,
  Clock,
  MessageSquare,
  Filter,
  Download,
  ExternalLink,
} from "lucide-react";
import { cities } from "@/data/menus";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

interface Submission {
  id: string;
  userId: string | null;
  userNickname: string | null;
  submitterName: string | null;
  submitterEmail: string | null;
  cityId: string;
  year: number;
  month: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  note: string | null;
  status: 'pending' | 'reviewed' | 'rejected';
  adminNote: string | null;
  reviewerName: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

const getAdminToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('adminToken');
  }
  return null;
};

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [stats, setStats] = useState({ pending: 0, reviewed: 0, rejected: 0, total: 0 });

  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");

  // Modal
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const months = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
  ];

  const fetchSubmissions = async () => {
    setIsLoading(true);
    try {
      const token = getAdminToken();
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (cityFilter) params.append('city', cityFilter);
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());

      const response = await fetch(`${API_URL}/submissions/admin/all?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Gönderiler alınamadı');

      const data = await response.json();
      setSubmissions(data.submissions);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Fetch submissions error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = getAdminToken();
      const response = await fetch(`${API_URL}/submissions/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
  };

  useEffect(() => {
    fetchSubmissions();
    fetchStats();
  }, [statusFilter, cityFilter, pagination.page]);

  const handleViewFile = async (submission: Submission) => {
    setSelectedSubmission(submission);
    setAdminNote(submission.adminNote || "");
    
    try {
      const token = getAdminToken();
      const response = await fetch(`${API_URL}/submissions/admin/${submission.id}/file`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
      }
    } catch (error) {
      console.error('File fetch error:', error);
    }
  };

  const handleDownloadFile = async (submission: Submission) => {
    try {
      const token = getAdminToken();
      const response = await fetch(`${API_URL}/submissions/admin/${submission.id}/file`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        alert('Dosya indirilemedi');
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = submission.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Dosya indirilemedi');
    }
  };

  const closeModal = () => {
    setSelectedSubmission(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setAdminNote("");
  };

  const handleUpdateStatus = async (status: 'reviewed' | 'rejected') => {
    if (!selectedSubmission) return;

    setIsUpdating(true);
    try {
      const token = getAdminToken();
      const response = await fetch(`${API_URL}/submissions/admin/${selectedSubmission.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, adminNote })
      });

      if (response.ok) {
        closeModal();
        fetchSubmissions();
        fetchStats();
      } else {
        alert('Durum güncellenemedi');
      }
    } catch (error) {
      console.error('Update status error:', error);
      alert('Bir hata oluştu');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu gönderiyi silmek istediğinize emin misiniz?')) return;

    try {
      const token = getAdminToken();
      const response = await fetch(`${API_URL}/submissions/admin/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchSubmissions();
        fetchStats();
      } else {
        alert('Gönderi silinemedi');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Bir hata oluştu');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("tr-TR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-medium">Bekliyor</span>;
      case 'reviewed':
        return <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium">İncelendi</span>;
      case 'rejected':
        return <span className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-medium">Reddedildi</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Menü Gönderileri</h1>
        <p className="text-slate-400 mt-1">Kullanıcılardan gelen menü görselleri</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl bg-slate-800/50 border border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-600/50">
              <Inbox className="h-5 w-5 text-slate-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-xs text-slate-400">Toplam</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20">
              <Clock className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
              <p className="text-xs text-amber-400/70">Bekliyor</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
              <Check className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-400">{stats.reviewed}</p>
              <p className="text-xs text-emerald-400/70">İncelendi</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/20">
              <X className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
              <p className="text-xs text-red-400/70">Reddedildi</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-slate-600 bg-slate-800 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
        >
          <option value="">Tüm Durumlar</option>
          <option value="pending">Bekliyor</option>
          <option value="reviewed">İncelendi</option>
          <option value="rejected">Reddedildi</option>
        </select>

        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="rounded-xl border border-slate-600 bg-slate-800 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
        >
          <option value="">Tüm Şehirler</option>
          {cities.map((city) => (
            <option key={city.id} value={city.id}>{city.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-800">
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Gönderen</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Şehir / Dönem</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Dosya</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Tarih</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Durum</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-400">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-4 py-4">
                      <div className="h-6 bg-slate-700 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : submissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    <Inbox className="h-12 w-12 mx-auto mb-4 text-slate-600" />
                    <p>Gönderi bulunamadı</p>
                  </td>
                </tr>
              ) : (
                submissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-500" />
                        <span className="text-sm text-white">
                          {submission.userNickname || submission.submitterName || "Anonim"}
                        </span>
                      </div>
                      {submission.submitterEmail && (
                        <div className="flex items-center gap-2 mt-1">
                          <Mail className="h-3 w-3 text-slate-500" />
                          <span className="text-xs text-slate-400">{submission.submitterEmail}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-white">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        {cities.find(c => c.id === submission.cityId)?.name || submission.cityId}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-3 w-3 text-slate-500" />
                        <span className="text-xs text-slate-400">
                          {months[submission.month - 1]} {submission.year}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {submission.fileType === 'application/pdf' ? (
                          <FileText className="h-4 w-4 text-red-400" />
                        ) : (
                          <Image className="h-4 w-4 text-blue-400" />
                        )}
                        <span className="text-sm text-slate-300 truncate max-w-[150px]">
                          {submission.fileName}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {formatFileSize(submission.fileSize)}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">
                      {formatDate(submission.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(submission.status)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleViewFile(submission)}
                          className="p-2 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                          title="Görüntüle"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadFile(submission)}
                          className="p-2 rounded-lg text-slate-400 hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors"
                          title="İndir"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(submission.id)}
                          className="p-2 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                          title="Sil"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-700 px-4 py-3">
            <p className="text-sm text-slate-400">
              Toplam {pagination.total} gönderi
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                disabled={pagination.page === 1}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-sm text-white">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
          
          <div className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl bg-slate-800 border border-slate-700 shadow-xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700 flex-shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-white">Gönderi Detayı</h2>
                <p className="text-sm text-slate-400 mt-1">
                  {cities.find(c => c.id === selectedSubmission.cityId)?.name} - {months[selectedSubmission.month - 1]} {selectedSubmission.year}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* File Preview */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-slate-300">Dosya Önizleme</h3>
                    <button
                      onClick={() => handleDownloadFile(selectedSubmission)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors text-sm"
                    >
                      <Download className="h-4 w-4" />
                      İndir
                    </button>
                  </div>
                  <div className="rounded-xl border border-slate-700 bg-slate-900 overflow-hidden">
                    {previewUrl ? (
                      selectedSubmission.fileType === 'application/pdf' ? (
                        <div className="p-8 text-center">
                          <FileText className="h-16 w-16 mx-auto text-red-400 mb-4" />
                          <p className="text-slate-300 mb-4">{selectedSubmission.fileName}</p>
                          <div className="flex items-center justify-center gap-2">
                            <a
                              href={previewUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition-colors"
                            >
                              <ExternalLink className="h-4 w-4" />
                              PDF'i Aç
                            </a>
                            <button
                              onClick={() => handleDownloadFile(selectedSubmission)}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                            >
                              <Download className="h-4 w-4" />
                              İndir
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="relative">
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-full h-auto max-h-[400px] object-contain"
                          />
                          <div className="absolute top-2 right-2">
                            <button
                              onClick={() => handleDownloadFile(selectedSubmission)}
                              className="p-2 rounded-lg bg-slate-800/90 text-white hover:bg-slate-700 transition-colors shadow-lg"
                              title="İndir"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="p-8 text-center">
                        <div className="h-8 w-8 mx-auto animate-spin rounded-full border-2 border-slate-600 border-t-emerald-500" />
                        <p className="text-slate-400 mt-4">Yükleniyor...</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Info & Actions */}
                <div className="space-y-6">
                  {/* Info */}
                  <div className="space-y-4">
                    <div className="rounded-xl bg-slate-700/50 p-4">
                      <p className="text-xs text-slate-400 mb-1">Gönderen</p>
                      <p className="text-white">
                        {selectedSubmission.userNickname || selectedSubmission.submitterName || "Anonim"}
                      </p>
                      {selectedSubmission.submitterEmail && (
                        <p className="text-sm text-slate-400 mt-1">{selectedSubmission.submitterEmail}</p>
                      )}
                    </div>

                    <div className="rounded-xl bg-slate-700/50 p-4">
                      <p className="text-xs text-slate-400 mb-1">Dosya</p>
                      <p className="text-white">{selectedSubmission.fileName}</p>
                      <p className="text-sm text-slate-400 mt-1">
                        {formatFileSize(selectedSubmission.fileSize)} • {selectedSubmission.fileType.split('/')[1].toUpperCase()}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-700/50 p-4">
                      <p className="text-xs text-slate-400 mb-1">Gönderim Tarihi</p>
                      <p className="text-white">{formatDate(selectedSubmission.createdAt)}</p>
                    </div>

                    {selectedSubmission.note && (
                      <div className="rounded-xl bg-slate-700/50 p-4">
                        <p className="text-xs text-slate-400 mb-1">Gönderen Notu</p>
                        <p className="text-white">{selectedSubmission.note}</p>
                      </div>
                    )}

                    <div className="rounded-xl bg-slate-700/50 p-4">
                      <p className="text-xs text-slate-400 mb-1">Durum</p>
                      <div className="mt-2">{getStatusBadge(selectedSubmission.status)}</div>
                      {selectedSubmission.reviewerName && (
                        <p className="text-xs text-slate-400 mt-2">
                          İnceleyen: {selectedSubmission.reviewerName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Admin Note */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Admin Notu
                    </label>
                    <textarea
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      placeholder="Gönderi hakkında not ekleyin..."
                      rows={3}
                      className="w-full rounded-xl border border-slate-600 bg-slate-700 p-4 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none resize-none"
                    />
                  </div>

                  {/* Actions */}
                  {selectedSubmission.status === 'pending' && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleUpdateStatus('reviewed')}
                        disabled={isUpdating}
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-white font-medium hover:bg-emerald-600 disabled:opacity-50 transition-colors"
                      >
                        {isUpdating ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                        İncelendi
                      </button>
                      <button
                        onClick={() => handleUpdateStatus('rejected')}
                        disabled={isUpdating}
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-red-500 py-3 text-white font-medium hover:bg-red-600 disabled:opacity-50 transition-colors"
                      >
                        {isUpdating ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                        Reddet
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

