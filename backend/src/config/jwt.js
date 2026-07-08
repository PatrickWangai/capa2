function requireSecret(name, ...aliases) {
  for (const key of [name, ...aliases]) {
    if (process.env[key]) return process.env[key];
  }
  throw new Error(`Missing required env var: ${name} (set it in .env — no insecure default is provided)`);
}

export const ACCESS_TOKEN_SECRET = requireSecret('JWT_SECRET', 'ACCESS_TOKEN_SECRET');
export const REFRESH_TOKEN_SECRET = requireSecret('JWT_REFRESH_SECRET', 'REFRESH_TOKEN_SECRET');
