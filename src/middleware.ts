import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

const PUBLIC_ROUTES = ['/login'];

interface JwtPayload {
    sub: string;
    role: string;
}

const ROLE_REDIRECTS: Record<string, string> = {
    admin: '/admin/dashboard',
    teacher: '/teacher/dashboard',
    student: '/student/dashboard',
    parent: '/parent/dashboard',
};

export function middleware(request: NextRequest) {
    const token = request.cookies.get('accessToken')?.value;
    const { pathname } = request.nextUrl;

    if (PUBLIC_ROUTES.includes(pathname)) {
        if (token) {
            try {
                const payload = jwtDecode<JwtPayload>(token);
                const redirect = ROLE_REDIRECTS[payload.role] ?? '/login';
                return NextResponse.redirect(new URL(redirect, request.url));
            } catch {
                return NextResponse.next();
            }
        }
        return NextResponse.next();
    }

    if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Role-based protection
    try {
        const payload = jwtDecode<JwtPayload>(token);

        if (pathname.startsWith('/admin') && payload.role !== 'admin') {
            const redirect = ROLE_REDIRECTS[payload.role] ?? '/login';
            return NextResponse.redirect(new URL(redirect, request.url));
        }

        if (pathname.startsWith('/teacher') && payload.role !== 'teacher') {
            const redirect = ROLE_REDIRECTS[payload.role] ?? '/login';
            return NextResponse.redirect(new URL(redirect, request.url));
        }

        if (pathname.startsWith('/student') && payload.role !== 'student') {
            const redirect = ROLE_REDIRECTS[payload.role] ?? '/login';
            return NextResponse.redirect(new URL(redirect, request.url));
        }

        if (pathname.startsWith('/parent') && payload.role !== 'parent') {
            const redirect = ROLE_REDIRECTS[payload.role] ?? '/login';
            return NextResponse.redirect(new URL(redirect, request.url));
        }

    } catch {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};