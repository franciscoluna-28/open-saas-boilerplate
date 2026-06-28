export const env = {
  get DATABASE_URL() {
    return assertEnv("DATABASE_URL");
  },
  get NODE_ENV() {
    return process.env.NODE_ENV ?? "development";
  },
  get isDev() {
    return this.NODE_ENV === "development";
  },
  get isProd() {
    return this.NODE_ENV === "production";
  },
  get PORT() {
    return process.env.PORT ?? "3000";
  },
  get BETTER_AUTH_URL() {
    return process.env.BETTER_AUTH_URL ?? `http://localhost:${this.PORT}`;
  },
  get BETTER_AUTH_SECRET() {
    return assertEnv("BETTER_AUTH_SECRET");
  },
  get S3_REGION() {
    return process.env.S3_REGION ?? process.env.AWS_REGION;
  },
  get S3_ENDPOINT() {
    return process.env.S3_ENDPOINT;
  },
  get S3_BUCKET() {
    return process.env.S3_BUCKET ?? process.env.AWS_S3_BUCKET;
  },
  get S3_ACCESS_KEY_ID() {
    return process.env.S3_ACCESS_KEY_ID ?? process.env.AWS_ACCESS_KEY_ID;
  },
  get S3_SECRET_ACCESS_KEY() {
    return process.env.S3_SECRET_ACCESS_KEY ?? process.env.AWS_SECRET_ACCESS_KEY;
  },
} as const;

function assertEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}
