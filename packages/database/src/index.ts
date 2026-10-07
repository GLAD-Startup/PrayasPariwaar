import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

let prismaInstance: any = global.prisma;

if (process.env.NODE_ENV !== "production") {
  if (prismaInstance && (!prismaInstance.timelineMilestone || !prismaInstance.award)) {
    try {
      prismaInstance.$disconnect();
    } catch {}
    delete (global as any).prisma;
    if (typeof require !== "undefined" && require.cache) {
      Object.keys(require.cache).forEach((key) => {
        if (key.includes("prisma")) {
          delete require.cache[key];
        }
      });
    }
    try {
      const { PrismaClient: FreshClient } = require("@prisma/client");
      prismaInstance = new FreshClient({
        log: ["query", "error", "warn"],
      });
      global.prisma = prismaInstance;
    } catch {}
  }
}

export const prisma =
  prismaInstance ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export * from "@prisma/client";
