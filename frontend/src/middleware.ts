import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const token = request.cookies.get("access_token")?.value;
    const { pathname } = request.nextUrl;

    // Define public paths
    const isPublicPath =
        pathname === "/" ||
        pathname === "/signin" ||
        pathname === "/signup" ||
        pathname === "/reset-password" ||
        pathname === "/invitation";

    // If the path is not public and no token is present, redirect to signin
    if (!isPublicPath && !token) {
        return NextResponse.redirect(new URL("/signin", request.url));
    }

    // If the path is public (like signin) and a token is present, redirect to dashboard
    if (
        isPublicPath &&
        token &&
        pathname !== "/" &&
        pathname !== "/reset-password" &&
        pathname !== "/invitation"
    ) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!api|_next/static|_next/image|favicon.ico|images).*)",
    ],
};
