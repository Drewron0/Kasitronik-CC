import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function getLoginUrl(requestUrl: URL, confirmation: "success" | "error") {
  const loginUrl = new URL("/login", requestUrl.origin);
  loginUrl.searchParams.set("confirmation", confirmation);
  return loginUrl;
}

function isMissingCodeVerifier(message?: string) {
  if (!message) return false;
  return /code verifier|both auth code and code verifier/i.test(message);
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const authError = requestUrl.searchParams.get("error");
  const code = requestUrl.searchParams.get("code");

  if (authError || !code) {
    return NextResponse.redirect(getLoginUrl(requestUrl, "error"));
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.redirect(getLoginUrl(requestUrl, "error"));
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    // Email confirmation already succeeded on Supabase before redirecting with ?code=...,
    // so opening the link in another browser/app without the PKCE cookie is still confirmed.
    if (isMissingCodeVerifier(error.message)) {
      return NextResponse.redirect(getLoginUrl(requestUrl, "success"));
    }
    return NextResponse.redirect(getLoginUrl(requestUrl, "error"));
  }

  return NextResponse.redirect(getLoginUrl(requestUrl, "success"));
}
