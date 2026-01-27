import DetailSubHeader from "@/components/public/shared/DetailSubHeader"
import CvList from "@/components/public/CvList"

export default function Contact() {
  return (
    <div className="space-y-4">
      <DetailSubHeader segments={[{ label: "text" }]} />
      {/* <div>text page</div> */}
      <div className="w-full flex justify-end items-start">
        <CvList category="solo exhibition" />
      </div>
    </div>
  )
}
