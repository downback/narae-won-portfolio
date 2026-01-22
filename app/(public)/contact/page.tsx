export default function Contact() {
  return (
    <div className="space-y-10 font-light pt-6 md:pt-30">
      <section className="flex flex-col gap-4 md:flex-row">
        <h2 className="w-full text-sm md:w-xs md:text-base">email</h2>
        <p className="text-base">
          <a href="mailto:denise@example.com" className="link-underline">
            denise@example.com
          </a>
        </p>
      </section>

      <section className="flex flex-col gap-4 md:flex-row">
        <h2 className="w-full text-sm md:w-xs md:text-base">instagram</h2>
        <p className="text-base">
          <a
            href="https://instagram.com/denisemaud"
            target="_blank"
            rel="noopener noreferrer"
            className="link-underline"
          >
            @denisemaud
          </a>
        </p>
      </section>
    </div>
  )
}
