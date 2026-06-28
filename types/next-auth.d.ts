import type { Role } from "@/lib/generated/prisma/enums"
import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      gymId: string
      roles: Role[]
      mustChangePassword: boolean
    } & DefaultSession["user"]
  }

  interface User {
    gymId: string
    roles: Role[]
    mustChangePassword: boolean
  }
}
