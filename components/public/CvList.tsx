"use client"

import CvItem from "@/components/public/CvItem"

type CvEntry = {
  id: string
  category: string
  description: string
  description_kr: string
}

type CvListProps = {
  items?: CvEntry[]
  category?: string
}

const placeholderItems: CvEntry[] = [
  {
    id: "cv-1",
    category: "solo exhibition",
    description: "2024, Studies in Silence, Berlin",
    description_kr: "2024, Studies in Silence, 베를린",
  },
  {
    id: "cv-2",
    category: "selected group shows",
    description: "2023, Quiet Forms, New York",
    description_kr: "2023, Quiet Forms, 뉴욕",
  },
  {
    id: "cv-3",
    category: "education",
    description: "2023, MFA, Sculpture, Yale School of Art",
    description_kr: "2023, MFA, 조형, 예일 대학교 조형 대학",
  },
]

export default function CvList({
  items = placeholderItems,
  category,
}: CvListProps) {
  return (
    <div className="w-full flex flex-col md:flex-row gap-2 md:gap-8">
      <div className="text-sm font-medium md:font-light w-48 text-left md:text-right">
        {category}
      </div>
      <div className="flex flex-col">
        {items.map((item) => (
          <CvItem key={item.id} description={item.description} />
        ))}
      </div>
    </div>
  )
}
