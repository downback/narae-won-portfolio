export const siteAssetsBucketName = "site-assets"

export const exhibitionCategories = [
  "solo-exhibitions",
  "group-exhibitions",
] as const

export type ExhibitionCategory = (typeof exhibitionCategories)[number]
