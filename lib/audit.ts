/**
 * Server-side audit: validate user from request and insert audit log rows.
 * Used by API routes that mutate data (assets, login, etc.).
 */

import { NextRequest } from 'next/server';
import { query } from '@/lib/db';

export interface AuditUser {
  phone: string;
  name: string;
}

/** Read X-User-Phone and X-User-Name from request. */
export function getUserFromRequest(request: NextRequest): AuditUser | null {
  const phone = request.headers.get('X-User-Phone')?.trim();
  const name = request.headers.get('X-User-Name')?.trim();
  if (!phone || !name) return null;
  return { phone, name };
}

/** Read X-Session-Id from request (one per login; distinguishes phone vs laptop vs PC). */
export function getSessionIdFromRequest(request: NextRequest): string | null {
  const id = request.headers.get('X-Session-Id')?.trim();
  return id || null;
}

export interface InsertAuditParams {
  user_phone: string;
  user_name: string;
  action: string;
  entity_type?: string | null;
  entity_id?: string | null;
  details?: Record<string, unknown> | null;
  session_id?: string | null;
}

/** Insert one row into audit_log. Does not throw; logs errors. */
export async function insertAuditLog(params: InsertAuditParams): Promise<void> {
  try {
    const { user_phone, user_name, action, entity_type, entity_id, details, session_id } = params;
    await query(
      `INSERT INTO audit_log (user_phone, user_name, action, entity_type, entity_id, details, session_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        user_phone,
        user_name,
        action,
        entity_type ?? null,
        entity_id ?? null,
        details != null ? JSON.stringify(details) : null,
        session_id ?? null,
      ]
    );
  } catch (err) {
    console.error('insertAuditLog error:', err);
  }
}
