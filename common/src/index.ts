import { z } from "zod";
export const signupInput = z.object({
    username: z.string(),
    password: z.string()
})
console.log("Imported from @09asad/common");

export type SignupParams = z.infer<typeof signupInput>;
