import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  );

  if (isDemoMode) {
    const originalFrom = client.from.bind(client);
    client.from = (table: string) => {
      const queryBuilder = originalFrom(table);
      const intercept = (methodName: string) => {
        return (...args: any[]) => {
          throw new Error(`Demo Mode: Mutation (${methodName}) disabled.`);
        };
      };

      return {
        ...queryBuilder,
        insert: intercept('insert'),
        update: intercept('update'),
        delete: intercept('delete'),
        upsert: intercept('upsert'),
      } as any;
    };
  }

  return client;
}
