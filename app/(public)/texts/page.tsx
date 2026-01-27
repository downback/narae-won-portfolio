import DetailSubHeader from "@/components/public/shared/DetailSubHeader"
import TextList from "@/components/public/TextList"

export default function Contact() {
  return (
    <div className="space-y-4">
      <DetailSubHeader segments={[{ label: "text" }]} />
      {/* <div>text page</div> */}
      <div className="w-full flex justify-end items-start">
        <TextList />
      </div>
    </div>
  )
}
