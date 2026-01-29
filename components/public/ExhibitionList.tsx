"use client"

import LightboxImage from "@/components/public/LightboxImage"

type Exhibition = {
  id: string
  title: string
  description: string
  mainImageSrc: string
  mainImageAlt?: string
  detailImages?: {
    id: string
    src: string
    alt: string
  }[]
}

export default function ExhibitionList({
  items = [],
}: {
  items?: Exhibition[]
}) {
  return (
    <div className="w-full flex flex-col justify-center items-center gap-14 text-center">
      {items.map((item) => (
        <div
          key={item.id}
          className="mx-auto  w-full md:w-xl xl:max-w-3xl space-y-4"
        >
          <div className="h-[60vh] w-full md:h-auto">
            <LightboxImage
              src={item.mainImageSrc}
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
