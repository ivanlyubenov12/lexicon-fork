// Service: classes — one function, one job
import { createServerClient } from '@/lib/supabase/server'

export async function getClassById(classId: string) {
  // TODO: fetch class + validate RLS (moderator owns it or member of it)
}

export async function createClass(moderatorId: string, name: string) {
  // TODO: insert into classes with status: draft
}

export async function updateClass(classId: string, updates: Record<string, unknown>) {
  // TODO: update class fields — moderator only
}

export async function finalizeClass(classId: string) {
  // TODO: lock content, trigger AI image generation, set status: ready_for_payment
}

export async function publishClass(classId: string) {
  // TODO: set status: published (called by Stripe webhook)
}
