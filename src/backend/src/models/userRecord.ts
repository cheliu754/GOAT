import * as z from "zod/v4";

const userRecordSchema = z.object({
    "collegeId": z.string(),
    "collegeName": z.string(),
    "deadline": z.date(),
    "progress": z.int(),
    "tasksDone": z.int(),
    "tasksTotal": z.int(),
    "status": z.string()
})
