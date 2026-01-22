import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Updates the session in middleware
 * 
 * Performance optimization: Uses getSession() instead of getUser() for most requests.
 * - getSession() only reads from cookies (fast, no network call)
 * - getUser() makes a network call to Supabase to validate the token (slow)
 * 
 * The session is still validated by the backend API on each request via JWT verification,
 * so we don't need to validate it in the middleware for every page load.
 * 
 * getUser() is only called when the session needs refresh (token close to expiry).
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Use getSession() for fast cookie-based auth check (no network call)
  // The session JWT is validated by the backend API anyway
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If session exists but is close to expiry (within 5 minutes), refresh it
  // This is the only time we make a network call
  if (session?.expires_at) {
    const expiresAt = session.expires_at * 1000; // Convert to ms
    const fiveMinutes = 5 * 60 * 1000;
    
    if (Date.now() > expiresAt - fiveMinutes) {
      // Token is close to expiry, refresh it
      const { data: { user } } = await supabase.auth.getUser();
      return { user, response: supabaseResponse };
    }
  }

  return { user: session?.user ?? null, response: supabaseResponse };
}
