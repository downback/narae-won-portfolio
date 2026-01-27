"use client"

import LightboxImage from "@/components/public/LightboxImage"

type Exhibition = {
  id: string
  title: string
  description: string
  mainImageSrc?: string
  mainImageAlt?: string
  detailImages?: {
    id: string
    src: string
    alt: string
  }[]
}

const placeholderSrc =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='800' viewBox='0 0 1200 800'%3E%3Crect width='1200' height='800' fill='%23E5E7EB'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239CA3AF' font-family='Arial, sans-serif' font-size='32'%3EImage placeholder%3C/text%3E%3C/svg%3E"

const placeholderItems: Exhibition[] = [
  {
    id: "exhibition-1",
    title: "Exhibition title",
    description: "Exhibition description placeholder text.",
    mainImageSrc: placeholderSrc,
    mainImageAlt: "Exhibition main image placeholder",
    detailImages: [
      {
        id: "detail-1",
        src: placeholderSrc,
        alt: "Exhibition detail image placeholder",
      },
      {
        id: "detail-2",
        src: placeholderSrc,
        alt: "Exhibition detail image placeholder",
      },
    ],
  },
]

export default function ExhibitionList({
  items = placeholderItems,
}: {
  items?: Exhibition[]
}) {
  return (
    <div className="w-full flex flex-col justify-center items-center gap-14 text-center">
      {items.map((item) => (
        <div
          key={item.id}
          className="mx-auto w-full max-w-2xl xl:max-w-3xl space-y-4"
        >
          <div className="h-[60vh] w-full md:h-auto">
            <LightboxImage
              src={item.mainImageSrc ?? placeholderSrc}
              alt={item.mainImageAlt ?? "Exhibition main image"}
              width={1200}
              height={800}
              sizes="(min-width: 768px) 768px, 100vw"
              className="block h-full w-full"
              imageClassName="h-full w-full object-cover md:h-auto md:w-full"
            />
          </div>

          <div className="px-1 text-sm md:text-[14px] font-light capitalize">
            {item.title}
          </div>

          <div className="flex flex-col gap-6">
            {(item.detailImages ?? []).map((image) => (
              <div key={image.id} className="h-[60vh] w-full md:h-auto">
                <LightboxImage
                  src={image.src}
                  alt={image.alt}
                  width={1200}
                  height={800}
                  sizes="(min-width: 768px) 768px, 100vw"
                  className="block h-full w-full"
                  imageClassName="h-full w-full object-cover md:h-auto md:w-full"
                />
              </div>
            ))}
          </div>

          <div className="px-1 text-sm md:text-[14px] font-light">
            {item.description}
          </div>
        </div>
      ))}
    </div>
  )
}
