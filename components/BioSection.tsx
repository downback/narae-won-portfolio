type BioItem = {
  year: string
  description: string
}

type BioSectionProps = {
  title: string
  items: BioItem[]
}

export default function BioSection({ title, items }: BioSectionProps) {
  return (
    <section className="flex flex-col gap-4 lg:flex-row">
      <h2 className="w-full text-sm md:w-xs md:text-base">{title}</h2>
      <ul className="space-y-2 md:space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex w-full flex-row-reverse justify-between md:w-xl md:flex-col"
          >
            <h3 className="ml-8 md:ml-0 text-sm">{item.year}</h3>
            <p className="text-base">{item.description}</p>
          </div>
        ))}
      </ul>
    </section>
  )
}
