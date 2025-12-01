import "@fastify/cookie";

declare module "fastify" {
  interface FastifyRequest {
    cookies: Record<string, string>;
    unsignCookie: (value: string) => { valid: boolean; value: string | null };
  }
}
