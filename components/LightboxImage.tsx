"use client"

import { useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

type LightboxImageProps = {
  src: string
  alt: string
  width: number
  height: number
  sizes?: string
  className?: string
  imageClassName?: string
  priority?: boolean
}

export default function LightboxImage({
  src,
  alt,
  width,
  height,
  sizes,
  className,
  imageClassName,
  priority = false,
}: LightboxImageProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => setIsOpen(true)}
        aria-label="Open image preview"
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          priority={priority}
          className={imageClassName}
        />
      </button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[95vw] w-[95vw] h-[95vh] border-none bg-transparent p-0 shadow-none">
          <div className="relative h-full w-full">
            <Image
              src={src}
              alt={alt}
              fill
              sizes="95vw"
              className="object-contain"
              priority
            />
            <div className="absolute right-4 top-4">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
