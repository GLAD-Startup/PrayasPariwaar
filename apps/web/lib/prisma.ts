import { prisma as basePrisma } from "@prayas/database";

let prisma: any = basePrisma;

if (process.env.NODE_ENV !== "production") {
  if (prisma && (!prisma.timelineMilestone || !prisma.award)) {
    try {
      const nodeRequire = eval("require");
      if (nodeRequire.cache) {
        Object.keys(nodeRequire.cache).forEach((key) => {
          if (key.includes("prisma")) {
            delete nodeRequire.cache[key];
          }
        });
      }
      const { PrismaClient } = nodeRequire("@prisma/client");
      prisma = new PrismaClient();
      (global as any).prisma = prisma;
    } catch (e) {
      console.warn("[Prisma Web Reload Warning]", e);
    }
  }
}

export { prisma };
export default prisma;
