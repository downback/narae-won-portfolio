"use client"

import TextItem from "@/components/public/TextItem"

type TextEntry = {
  id: string
  year: string
  title: string
  body: string
}

type TextListProps = {
  items?: TextEntry[]
}

const placeholderItems: TextEntry[] = [
  {
    id: "text-1",
    year: "2024",
    title: "Text title placeholder",
    body: "Text body placeholder content goes here.",
  },
  {
    id: "text-2",
    year: "2023",
    title: "Another text title",
    body: "Another placeholder body for the text item.",
  },
  {
    id: "text-3",
    year: "2024",
    title: "Text title placeholder",
    body: "Text body placeholder content goes here.",
  },
  {
    id: "text-4",
    year: "2023",
    title: "Another text title",
    body: "Another placeholder body for the text item.",
  },
]

export default function TextList({ items = placeholderItems }: TextListProps) {
  return (
    <div className="w-full md:w-2xl xl:w-2/3 flex flex-col border-t-[0.9px] border-black">
      {items.map((item) => (
        <TextItem
          key={item.id}
          year={item.year}
          title={item.title}
          body={item.body}
        />
      ))}
    </div>
  )
}
