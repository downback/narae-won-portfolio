// import BioSection from "@/components/public/BioSection"
import DetailSubHeader from "@/components/public/shared/DetailSubHeader"
import { supabaseServer } from "@/lib/server"
import CvList from "@/components/public/CvList"

const formatBioItems = (
  rows: { title: string; location: string; year: number }[],
) =>
  rows.map((row) => ({
    year: String(row.year),
    description: `${row.title}, ${row.location}`,
  }))

const education = [
  {
    year: "2023",
    description: "MFA, Sculpture, Yale School of Art",
  },
  {
    year: "2020",
    description: "BFA, Fine Arts, Rhode Island School of Design",
  },
  {
    year: "2018",
    description: "Residency, Skowhegan School of Painting & Sculpture",
  },
]

export default async function Bio() {
  return (
    <div className="font-light">
      <DetailSubHeader segments={[{ label: "cv" }]} />
      <div className="flex md:flex-row flex-col w-full">
        <div className="flex-1">
          <div className="text-[14px] font-medium mb-2 mt-2 md:mt-0">
            원나래 | Narae Won
          </div>
          <div className="text-sm/4 font-light">1992 출생</div>
          <div className="text-sm/4 font-light">born in 1992</div>
        </div>
        <div className="mt-6 md:mt-0 flex flex-col gap-6 md:gap-8 flex-4">
          <CvList category="solo exhibition" />
          <CvList category="selected group shows" />
          <CvList category="education" />
        </div>
      </div>
    </div>
  )
}
