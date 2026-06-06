import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  getEvolutionQrAdmin,
  refreshEvolutionConnectionAdmin,
  saveEvolutionInstanceAdmin,
} from "@/lib/evolution/admin.server";
import { assertSetupKey } from "@/lib/evolution/setup-auth.server";

const setupKeySchema = z.object({ setupKey: z.string().min(1) });

export const setupSaveEvolutionRemote = createServerFn({ method: "POST" })
  .inputValidator((data: { setupKey: string; instanceName: string; connectionPhone: string; recreate?: boolean }) =>
    setupKeySchema
      .extend({
        instanceName: z.string().min(1),
        connectionPhone: z.string().regex(/^\d{11}$/),
        recreate: z.boolean().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    assertSetupKey(data.setupKey);
    return saveEvolutionInstanceAdmin(data.instanceName, data.connectionPhone, undefined, {
      recreate: data.recreate,
    });
  });

export const setupGetEvolutionQrRemote = createServerFn({ method: "POST" })
  .inputValidator((data: { setupKey: string }) => setupKeySchema.parse(data))
  .handler(async ({ data }) => {
    assertSetupKey(data.setupKey);
    return getEvolutionQrAdmin();
  });

export const setupRefreshEvolutionRemote = createServerFn({ method: "POST" })
  .inputValidator((data: { setupKey: string }) => setupKeySchema.parse(data))
  .handler(async ({ data }) => {
    assertSetupKey(data.setupKey);
    return refreshEvolutionConnectionAdmin();
  });
