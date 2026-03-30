import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "admin_session";
const ALLOWED_DOMAIN = "sportsdeck.io";

function getExpectedToken() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  return Buffer.from(password).toString("base64");
}

// POST /api/admin/auth — verify email domain + password, set session cookie
export async function POST(req: NextRequest) {
  const { email, password, rememberMe } = await req.json();

  // Validate email domain
  if (!email || !email.toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`)) {
    return NextResponse.json({ error: "Access restricted to @sportsdeck.io accounts" }, { status: 403 });
  }

  const expected = getExpectedToken();
  if (!expected || Buffer.from(password).toString("base64") !== expected) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const maxAge = rememberMe
    ? 60 * 60 * 24 * 30  // 30 days
    : 60 * 60 * 8;        // 8 hours

  const res = NextResponse.json({ success: true });
  res.cookies.set(COOKIE_NAME, expected, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge,
    path: "/",
  });
  return res;
}

// GET /api/admin/auth — check if session cookie is valid
export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const expected = getExpectedToken();

  if (!expected || token !== expected) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true });
}

// DELETE /api/admin/auth — clear session cookie (logout)
export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(COOKIE_NAME, "", { maxAge: 0, path: "/" });
  return res;
}
