/**
 * Adresse et clé publique du projet Supabase (voir docs/comptes.md).
 *
 * La clé « anon » (ou « publishable ») est faite pour être publiée : ce sont les règles d'accès
 * de `supabase/schema.sql` qui protègent les données. Ne jamais mettre ici la clé « service_role »
 * (ou « secret »), qui contourne ces règles.
 *
 * Laissées vides, le jeu fonctionne en mode démo (comptes gardés dans le navigateur).
 */
export const SUPABASE_URL: string = import.meta.env.VITE_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY: string = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';
