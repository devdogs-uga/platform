import * as z from "zod";

function singleSelectOption<T extends string>(options: T[]) {
  return z.object({
    id: z.number(),
    data_type: z.literal("single_select"),
    options: z
      .object({
        id: z.string(),
        name: z.object({
          raw: z
            .string()
            .transform((str) => parseInt(str).toString())
            .pipe(z.literal(options)),
        }),
      })
      .transform((item) => [item.name.raw, item.id])
      .array()
      .transform(Object.fromEntries)
      .pipe(z.record(z.enum(options), z.string())),
  });
}

function singleSelectValue<T extends z.ZodNumber>(subSchema: T) {
  return z
    .object({
      data_type: z.literal("single_select"),
      value: z.object({
        name: z.object({
          raw: z.string(),
        }),
      }),
    })
    .transform((obj) => parseInt(obj.value.name.raw))
    .pipe(subSchema);
}

export const projectResults = z.object({ number: z.number() }).array();

export type ProjectResult = z.infer<typeof projectResults>[number];

export const fieldsResults = z
  .looseObject({
    name: z.string(),
  })
  .transform((field) => [field.name, field])
  .array()
  .transform(Object.fromEntries)
  .pipe(
    z.object({
      Priority: singleSelectOption(["4", "3", "2", "1"]),
      Complexity: singleSelectOption(["3", "2", "1"]),
      Quality: singleSelectOption(["3", "2", "1"]),
      "Time Estimate (Minutes)": z.object({
        id: z.number(),
        data_type: z.literal("number"),
      }),
    }),
  );

export type FieldsResult = z.infer<typeof fieldsResults>;

export const userResult = z.object({
  id: z.number(),
  login: z.string(),
  avatar_url: z.string().nullish(),
});

export type UserResult = z.infer<typeof userResult>;

export const issueResults = z
  .object({
    content_type: z.literal("Issue"),
    content: z.object({
      state: z.literal("closed"),
      assignees: userResult.array(),
      closed_at: z.iso.datetime(),
    }),
    fields: z
      .looseObject({
        name: z.string(),
      })
      .transform((field) => [field.name, field])
      .array()
      .transform(Object.fromEntries)
      .pipe(
        z.object({
          Priority: singleSelectValue(z.int().min(1).max(4)),
          Complexity: singleSelectValue(z.int().min(1).max(3)),
          Quality: singleSelectValue(z.int().min(1).max(3)),
          "Time Estimate (Minutes)": z
            .object({
              id: z.number(),
              data_type: z.literal("number"),
              value: z.number(),
            })
            .transform((obj) => obj.value),
        }),
      ),
  })
  .array();

export type IssueResult = z.infer<typeof issueResults>[number];
