import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const EMPLOYEE_ALLOWED_PREFIX = "/dashboard/staff";

async function isEmployeeOnlyUser(
  supabase: ReturnType<typeof createServerClient>,
  userId: string
): Promise<boolean> {
  const { data: owned } = await supabase
    .from("restaurants")
    .select("id")
    .eq("owner_id", userId)
    .limit(1);

  if (owned && owned.length > 0) {
    return false;
  }

  const { data: employment } = await supabase
    .from("restaurant_employees")
    .select("id")
    .eq("profile_id", userId)
    .limit(1);

  return Boolean(employment && employment.length > 0);
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (!user && pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user) {
    const employeeOnly = await isEmployeeOnlyUser(supabase, user.id);

    if (employeeOnly) {
      const allowed =
        pathname === EMPLOYEE_ALLOWED_PREFIX ||
        pathname.startsWith(`${EMPLOYEE_ALLOWED_PREFIX}/`);

      if (pathname.startsWith("/dashboard") && !allowed) {
        const url = request.nextUrl.clone();
        url.pathname = EMPLOYEE_ALLOWED_PREFIX;
        return NextResponse.redirect(url);
      }
    }

    if (pathname === "/login" || pathname === "/register") {
      const url = request.nextUrl.clone();
      url.pathname = employeeOnly ? EMPLOYEE_ALLOWED_PREFIX : "/dashboard";
      return NextResponse.redirect(url);
    }

    if (pathname === "/dashboard") {
      const url = request.nextUrl.clone();
      url.pathname = employeeOnly ? EMPLOYEE_ALLOWED_PREFIX : "/dashboard";
      if (employeeOnly) {
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}
