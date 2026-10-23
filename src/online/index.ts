import { SUPABASE_ANON_KEY, SUPABASE_URL } from './config';
import { LocalBackend } from './local';
import type { Backend } from './types';

let backend: Promise<Backend> | null = null;

/**
 * Le service de comptes : Supabase s'il est configuré (chargé seulement à ce moment-là),
 * sinon le mode démo dans le navigateur.
 */
export function getBackend(): Promise<Backend> {
  backend ??=
    SUPABASE_URL && SUPABASE_ANON_KEY
      ? import('./supabase').then(({ SupabaseBackend }) => new SupabaseBackend(SUPABASE_URL, SUPABASE_ANON_KEY))
      : Promise.resolve(new LocalBackend(localStorage));
  return backend;
}

export * from './types';
