process.env.NODE_ENV ??= "test";
process.env.DATABASE_URL ??=
  "postgresql://postgres:postgres@localhost:5432/typebot";
process.env.ENCRYPTION_SECRET ??= "12345678901234567890123456789012";
process.env.NEXTAUTH_URL ??= "http://localhost:3000";
process.env.NEXT_PUBLIC_VIEWER_URL ??= "http://localhost:3001";
