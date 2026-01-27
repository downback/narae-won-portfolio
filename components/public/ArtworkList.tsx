import ArtworkItem from "@/components/public/ArtworkItem"

type Artwork = {
  id: string
  title: string
  description: string
  imageSrc?: string
  imageAlt?: string
}

type ArtworkListProps = {
  items?: Artwork[]
}

const placeholderItems: Artwork[] = [
  {
    id: "work-1",
    title: "Work title",
    description: "Work description placeholder text.",
  },
  {
    id: "work-2",
    title: "Another work title Another work title Another work title",
    description:
      "Another work description placeholder text. Another work description placeholder text. Another work description placeholder text.",
  },
]

export default function ArtworkList({
  items = placeholderItems,
}: ArtworkListProps) {
  return (
    <div className="w-full md:mt-24 flex flex-col justify-center items-center gap-14">
      {items.map((item) => (
        <ArtworkItem
          key={item.id}
          title={item.title}
          description={item.description}
          imageSrc={item.imageSrc}
          imageAlt={item.imageAlt}
        />
      ))}
    </div>
  )
}
