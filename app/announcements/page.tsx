'use client';

import { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { getAuthHeaders } from '@/lib/auth';
import { Megaphone, Send, Plus, User } from 'lucide-react';

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

export default function AnnouncementsPage() {
  const [list, setList] = useState<Announcement[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formBody, setFormBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const limit = 20;

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/announcements?page=${page}&limit=${limit}`);
      if (!res.ok) throw new Error('Failed to load');
      const json: AnnouncementsResponse = await res.json();
      setList(json.data ?? []);
      setTotal(json.total ?? 0);
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
      const res = await fetch('/api/announcements', {
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

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-green-500/10 dark:bg-green-500/20">
              <Megaphone className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Announcements</h1>
              <p className="text-sm text-muted-foreground">Broadcast messages to all users — new features, updates, and info.</p>
            </div>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="gap-2 bg-green-600 hover:bg-green-700 text-white shrink-0"
          >
            <Plus className="h-4 w-4" />
            New announcement
          </Button>
        </div>

        {showForm && (
          <Card className="border-green-200 dark:border-green-800/50 bg-green-50/30 dark:bg-green-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Send className="h-4 w-4" />
                Send announcement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                {error && (
                  <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-md">
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
                    className="max-w-xl"
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
                    className="flex w-full max-w-xl rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={submitting}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={submitting} className="gap-2 bg-green-600 hover:bg-green-700">
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

        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            {total} announcement{total !== 1 ? 's' : ''}
          </h2>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          ) : list.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Megaphone className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-sm font-medium text-foreground">No announcements yet</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  Create one to notify all users about new features, updates, or important information.
                </p>
                <Button onClick={() => setShowForm(true)} className="mt-4 gap-2 bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4" />
                  New announcement
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {list.map((a) => (
                <Card key={a.id} className="overflow-hidden transition-shadow hover:shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="text-base font-semibold leading-tight">{a.title}</CardTitle>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(a.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <User className="h-3.5 w-3.5" />
                      <span>{a.created_by_name}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-foreground/90 whitespace-pre-wrap">{a.body || a.title}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {total > limit && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {Math.ceil(total / limit)}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= Math.ceil(total / limit)}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
