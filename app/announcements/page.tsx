'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { getAuthHeaders, getSession, canSendAnnouncement } from '@/lib/auth';
import { markAnnouncementsAsSeen, getUnreadCount, getLastSeenAnnouncementId } from '@/lib/announcements-seen';
import { Megaphone, Send, Plus, User, Search, X, ChevronDown, ChevronUp, Sparkles, Calendar } from 'lucide-react';
import { AnnouncementBodyWithStatus } from '@/lib/announcement-body';
import { apiUrl } from '@/lib/api-client';

interface Announcement {
  id: number;
  title: string;
  body: string;
  created_by_phone: string;
  created_by_name: string;
  created_at: string;
}

interface AnnouncementsResponse {
  data: Announcement[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

function formatRelativeTime(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(iso);
  } catch {
    return iso;
  }
}

function getInitial(name: string): string {
  const n = (name || '').trim();
  if (!n) return '?';
  const parts = n.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0]! + parts[parts.length - 1]![0]).toUpperCase();
  return n.slice(0, 2).toUpperCase();
}

const BODY_PREVIEW_LINES = 3;
const LINE_HEIGHT = 1.4;

export default function AnnouncementsPage() {
  const session = getSession();
  const canSend = session ? canSendAnnouncement(session.user.phone) : false;
  const [list, setList] = useState<Announcement[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formBody, setFormBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [lastSeenId, setLastSeenId] = useState(0);

  const limit = 12;

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl(`/api/v1/announcements?page=${page}&limit=${limit}`));
      if (!res.ok) throw new Error('Failed to load');
      const json: AnnouncementsResponse = await res.json();
      const data = json.data ?? [];
      setList(data);
      setTotal(json.total ?? 0);
      setLastSeenId(getLastSeenAnnouncementId());
    } catch (err) {
      setList([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // Mark as seen only after user has been on page 2s (avoids prefetch marking)
  useEffect(() => {
    if (list.length === 0) return;
    const t = setTimeout(() => {
      markAnnouncementsAsSeen(list.map((a) => a.id));
    }, 2000);
    return () => clearTimeout(t);
  }, [list]);

  const unreadCount = useMemo(() => getUnreadCount(list), [list]);
  const filteredList = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        (a.body || '').toLowerCase().includes(q) ||
        (a.created_by_name || '').toLowerCase().includes(q)
    );
  }, [list, search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const title = formTitle.trim();
    if (!title) {
      setError('Title is required.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(apiUrl('/api/v1/announcements'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ title, body: formBody.trim() || title }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || data.error || 'Failed to send');
      }
      setFormTitle('');
      setFormBody('');
      setShowForm(false);
      fetchList();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send announcement.');
    } finally {
      setSubmitting(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Hero — matches sidebar green */}
        <div className="relative overflow-hidden rounded-xl border border-[#16A34A]/20 bg-gradient-to-br from-green-50/95 via-emerald-50/60 to-teal-50/50 dark:from-green-950/40 dark:via-emerald-950/30 dark:to-teal-950/30 shadow-sm">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(22,163,74,0.15),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(22,163,74,0.08),transparent)]" />
          <div className="relative flex flex-wrap items-center justify-between gap-4 p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#16A34A]/15 dark:bg-[#16A34A]/20 border border-[#16A34A]/30 dark:border-[#15803D]/50 shadow-inner">
                <Megaphone className="h-6 w-6 text-[#15803D] dark:text-green-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">Announcements</h1>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-[#16A34A] px-2 py-0.5 text-xs font-bold text-white shadow-sm">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Broadcast messages to all users — features, updates, and important info.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {total > 0 && (
                <span className="rounded-lg bg-background/80 dark:bg-background/60 px-3 py-1.5 text-xs font-semibold tabular-nums text-muted-foreground border border-border/60">
                  {total.toLocaleString()} total
                </span>
              )}
              {canSend && (
                <Button
                  onClick={() => setShowForm(true)}
                  className="gap-2 bg-[#16A34A] hover:bg-[#15803D] dark:bg-[#16A34A] dark:hover:bg-[#15803D] text-white shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  New announcement
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Search + Create form toggle */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, message, or author…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 rounded-lg border-border/80 bg-background"
            />
          </div>
          {canSend && !showForm && (
            <Button variant="outline" onClick={() => setShowForm(true)} className="gap-2 shrink-0 border-[#16A34A]/40 dark:border-green-700/50 text-[#15803D] dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30">
              <Sparkles className="h-4 w-4" />
              Compose
            </Button>
          )}
        </div>

        {/* Create form — modal-style, sidebar green */}
        {showForm && (
          <Card className="border-2 border-[#16A34A]/30 dark:border-green-700/50 bg-gradient-to-b from-green-50/50 to-background dark:from-green-950/20 dark:to-background shadow-lg">
            <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-border/60 bg-green-50/50 dark:bg-green-950/30">
              <CardTitle className="text-base flex items-center gap-2">
                <Send className="h-4 w-4 text-[#15803D] dark:text-green-400" />
                Send announcement
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => { setShowForm(false); setError(''); }} className="rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleCreate} className="space-y-4">
                {error && (
                  <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg border border-red-200 dark:border-red-900/50">
                    {error}
                  </p>
                )}
                <div className="space-y-2">
                  <Label htmlFor="ann-title">Title *</Label>
                  <Input
                    id="ann-title"
                    placeholder="e.g. New feature: Equipment export"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="max-w-xl rounded-lg border-[#16A34A]/30 dark:border-green-700/50 focus-visible:ring-[#16A34A]"
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ann-body">Message</Label>
                  <textarea
                    id="ann-body"
                    placeholder="Write your message for all users…"
                    value={formBody}
                    onChange={(e) => setFormBody(e.target.value)}
                    rows={4}
                    className="flex w-full max-w-xl rounded-lg border border-[#16A34A]/30 dark:border-green-700/50 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16A34A] focus-visible:ring-offset-2 disabled:opacity-50 resize-y min-h-[100px]"
                    disabled={submitting}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={submitting} className="gap-2 bg-[#16A34A] hover:bg-[#15803D] dark:bg-[#16A34A] dark:hover:bg-[#15803D] text-white">
                    <Send className="h-4 w-4" />
                    {submitting ? 'Sending…' : 'Send to all users'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => { setShowForm(false); setError(''); }} disabled={submitting}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* List */}
        <div className="space-y-4">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-44 rounded-xl" />
              ))}
            </div>
          ) : filteredList.length === 0 ? (
            <Card className="border-dashed border-2 border-[#16A34A]/30 dark:border-green-700/40 overflow-hidden">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-5 mb-4">
                  <Megaphone className="h-12 w-12 text-[#15803D] dark:text-green-400" />
                </div>
                <p className="text-lg font-semibold text-foreground">
                  {search.trim() ? 'No matching announcements' : 'No announcements yet'}
                </p>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                  {search.trim()
                    ? 'Try a different search.'
                    : canSend
                      ? 'Create one to notify all users about new features, updates, or important information.'
                      : 'Announcements will appear here when they are published.'}
                </p>
                {canSend && !search.trim() && (
                  <Button onClick={() => setShowForm(true)} className="mt-5 gap-2 bg-[#16A34A] hover:bg-[#15803D] dark:bg-[#16A34A] dark:hover:bg-[#15803D] text-white">
                    <Plus className="h-4 w-4" />
                    New announcement
                  </Button>
                )}
                {search.trim() && (
                  <Button variant="outline" onClick={() => setSearch('')} className="mt-5">
                    Clear search
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
              {filteredList.map((a) => {
                const isNew = a.id > lastSeenId;
                const isExpanded = expandedId === a.id;
                const bodyText = a.body || a.title;
                const lineCount = bodyText.split('\n').length;
                const needsExpand = lineCount > BODY_PREVIEW_LINES || bodyText.length > 200;
                const preview =
                  bodyText.split('\n').slice(0, BODY_PREVIEW_LINES).join('\n').slice(0, 200) + (bodyText.length > 200 ? '…' : '');
                const displayText = needsExpand && !isExpanded ? preview : bodyText;

                return (
                  <Card
                    key={a.id}
                    className={`overflow-hidden transition-all duration-200 hover:shadow-lg border-2 ${
                      isNew
                        ? 'border-[#16A34A]/40 dark:border-green-700/50 bg-green-50/40 dark:bg-green-950/25'
                        : 'border-border/80 hover:border-[#16A34A]/30 dark:hover:border-green-700/40'
                    }`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex gap-3 min-w-0 flex-1">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#16A34A]/15 dark:bg-green-500/10 border border-[#16A34A]/30 dark:border-green-700/50 text-[#15803D] dark:text-green-400 font-semibold text-sm">
                            {getInitial(a.created_by_name)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <CardTitle className="text-base font-semibold leading-tight line-clamp-2">{a.title}</CardTitle>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {a.created_by_name}
                              </span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatRelativeTime(a.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {isNew && (
                            <span className="rounded-full bg-[#16A34A] px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wide">
                              New
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground whitespace-nowrap" title={formatDate(a.created_at)}>
                            {formatDate(a.created_at)}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed" style={{ lineHeight: LINE_HEIGHT }}>
                        <AnnouncementBodyWithStatus text={displayText} />
                        {needsExpand && !isExpanded && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setExpandedId(a.id); }}
                            className="ml-1 text-[#15803D] dark:text-green-400 font-medium hover:underline inline-flex items-center gap-0.5"
                          >
                            Read more
                            <ChevronDown className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {needsExpand && isExpanded && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setExpandedId(null); }}
                            className="mt-1 inline-flex items-center gap-0.5 text-[#15803D] dark:text-green-400 font-medium hover:underline"
                          >
                            Show less
                            <ChevronUp className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-4 px-1 py-2">
            <span className="text-xs text-muted-foreground tabular-nums">
              Showing <span className="font-semibold text-foreground">{(page - 1) * limit + 1}–{Math.min(page * limit, total)}</span> of {total.toLocaleString()}
            </span>
            <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-muted/20 dark:bg-muted/10 p-0.5 shadow-sm">
              <Button
                variant="ghost"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-8 px-2 rounded-md"
              >
                Previous
              </Button>
              <span className="min-w-[5rem] text-center text-xs font-medium tabular-nums px-2">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="h-8 px-2 rounded-md"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
