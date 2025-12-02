import * as z from "zod/v4";

const collegeSchema = z.object({
    "collegeId": z.string(),
    "collegeName": z.string(),
    "city": z.string(),
    "state": z.string()
});