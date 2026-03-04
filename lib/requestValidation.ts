import { z } from "zod"

const minimumYear = 1900
const maximumYear = 2100

const textPayloadSchema = z
  .object({
    title: z.unknown(),
    body: z.unknown(),
    year: z.unknown(),
  })
  .superRefine((payload, context) => {
    const title =
      typeof payload.title === "string" ? payload.title.toString().trim() : ""
    const body =
      typeof payload.body === "string" ? payload.body.toString().trim() : ""
    const year = payload.year

    if (!title || !body) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Title and body are required.",
      })
      return
    }

    if (typeof year !== "number" || Number.isNaN(year)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Year must be a number.",
      })
      return
    }

    if (year < minimumYear || year > maximumYear) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Year must be between ${minimumYear} and ${maximumYear}.`,
      })
    }
  })
  .transform((payload) => ({
    title: (payload.title as string).toString().trim(),
    body: (payload.body as string).toString().trim(),
    year: payload.year as number,
  }))

const singleYearPattern = /^\d{4}$/
const yearRangePattern = /^(\d{4})-(\d{4})$/

const workMetadataSchema = z
  .object({
    yearCategory: z.string(),
    title: z.string(),
    caption: z.string(),
  })
  .superRefine((input, context) => {
    const yearCategory = input.yearCategory.trim()
    const title = input.title.trim()
    const caption = input.caption.trim()

    if (!yearCategory) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Year is required.",
      })
      return
    }

    const isSingleYear = singleYearPattern.test(yearCategory)
    const rangeMatch = yearCategory.match(yearRangePattern)

    if (!isSingleYear && !rangeMatch) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Year must be in YYYY or YYYY-YYYY format.",
      })
      return
    }

    if (rangeMatch) {
      const start = Number(rangeMatch[1])
      const end = Number(rangeMatch[2])
      if (start >= end) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Range start year must be less than end year.",
        })
        return
      }
    }

    const startYear = rangeMatch ? Number(rangeMatch[1]) : Number(yearCategory)
    if (startYear < minimumYear || startYear > maximumYear) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Year must be between ${minimumYear} and ${maximumYear}.`,
      })
      return
    }

    if (!title) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Title is required.",
      })
      return
    }

    if (!caption) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Caption is required.",
      })
    }
  })
  .transform((input) => {
    const yearCategory = input.yearCategory.trim()
    const rangeMatch = yearCategory.match(yearRangePattern)
    const year = rangeMatch ? Number(rangeMatch[1]) : Number(yearCategory)
    return {
      year,
      yearCategory,
      title: input.title.trim(),
      caption: input.caption.trim(),
    }
  })

type ValidationResult<T> =
  | { data: T; errorMessage: null }
  | { data: null; errorMessage: string }

export type TextPayloadValidationData = {
  title: string
  body: string
  year: number
}

export type WorkMetadataValidationData = {
  year: number
  yearCategory: string
  title: string
  caption: string
}

export const validateTextPayload = (
  payload: unknown,
): ValidationResult<TextPayloadValidationData> => {
  const parseResult = textPayloadSchema.safeParse(payload)
  if (!parseResult.success) {
    return {
      data: null,
      errorMessage: parseResult.error.issues[0]?.message || "Invalid request body.",
    }
  }

  return {
    data: parseResult.data as TextPayloadValidationData,
    errorMessage: null,
  }
}

export const validateWorkMetadata = (input: {
  yearCategory: string
  title: string
  caption: string
}): ValidationResult<WorkMetadataValidationData> => {
  const parseResult = workMetadataSchema.safeParse(input)
  if (!parseResult.success) {
    return {
      data: null,
      errorMessage: parseResult.error.issues[0]?.message || "Invalid request body.",
    }
  }

  return {
    data: parseResult.data as WorkMetadataValidationData,
    errorMessage: null,
  }
}
