/**
 * Adresse et clé publique du projet Supabase (voir docs/comptes.md).
 *
 * La clé « anon » (ou « publishable ») est faite pour être publiée : ce sont les règles d'accès
 * de `supabase/schema.sql` qui protègent les données. Ne jamais mettre ici la clé « service_role »
 * (ou « secret »), qui contourne ces règles.
 *
 * Les variables VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY, si elles sont définies, passent avant.
 * Laissées vides, le jeu fonctionne en mode démo (comptes gardés dans le navigateur).
 */
export const SUPABASE_URL: string = import.meta.env.VITE_SUPABASE_URL ?? 'https://bxpxyaieswdnyjklcfyj.supabase.co';
export const SUPABASE_ANON_KEY: string = import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'sb_publishable_AG1nvF-FDud1yJMcsjCHaw_6pvXpMMM';
