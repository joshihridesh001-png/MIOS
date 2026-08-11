import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  if (isDemoMode) {
    // Proxy the 'from' method to intercept mutations in demo mode
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
