// Owned by Camille. Small presentational pieces shared by /blog and /alternatives.
import Link from "next/link";
import { JsonLd, breadcrumbLd } from "./JsonLd";

/** Typography for rendered Markdown / long-form copy (no typography plugin needed). */
export const proseClass = [
  "text-[17px] leading-[1.75] text-[#2a2d4f]",
  "[&_p]:my-5",
  "[&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-[#1B1D3A] [&_h2]:scroll-mt-24",
  "[&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-[#1B1D3A] [&_h3]:scroll-mt-24",
  "[&_a]:text-[#4f5bd5] [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-[#1B1D3A]",
  "[&_ul]:my-5 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1.5",
  "[&_strong]:font-semibold [&_strong]:text-[#1B1D3A]",
  "[&_code]:rounded [&_code]:bg-[#f1f2fb] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.9em]",
  "[&_pre]:my-6 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-[#1B1D3A] [&_pre]:p-4 [&_pre]:text-sm [&_pre]:text-white [&_pre_code]:bg-transparent [&_pre_code]:p-0",
  "[&_blockquote]:my-6 [&_blockquote]:rounded-r-xl [&_blockquote]:border-l-4 [&_blockquote]:border-[#7C8CFF] [&_blockquote]:bg-[#f6f7ff] [&_blockquote]:px-5 [&_blockquote]:py-1",
  "[&_.table-wrap]:my-6 [&_.table-wrap]:overflow-x-auto [&_.table-wrap]:rounded-xl [&_.table-wrap]:border [&_.table-wrap]:border-[#e6e7f3]",
  "[&_table]:w-full [&_table]:border-collapse [&_table]:text-[15px] [&_th]:bg-[#f6f7ff] [&_th]:px-3 [&_th]:py-2.5 [&_th]:text-left [&_th]:font-semibold",
  "[&_td]:border-t [&_td]:border-[#e6e7f3] [&_td]:px-3 [&_td]:py-2.5 [&_td]:align-top",
].join(" ");

export function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  return (
    <>
      <nav aria-label="Breadcrumb" className="text-sm text-[#6B6F93]">
        <ol className="flex flex-wrap gap-1.5">
          {items.map((it, i) => (
            <li key={it.path} className="flex items-center gap-1.5">
              {i > 0 && <span aria-hidden>/</span>}
              {i < items.length - 1 ? (
                <Link href={it.path} className="hover:text-[#1B1D3A] hover:underline">{it.name}</Link>
              ) : (
                <span aria-current="page" className="text-[#1B1D3A]">{it.name}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd data={breadcrumbLd(items)} />
    </>
  );
}

export function CreateCta({ title = "Create your mascot", text }: { title?: string; text?: string }) {
  return (
    <aside className="my-12 rounded-3xl bg-gradient-to-br from-[#7C8CFF] via-[#FF8FC7] to-[#FFC46B] p-[2px]">
      <div className="rounded-[22px] bg-white px-6 py-8 text-center sm:px-10">
        <p className="text-2xl font-bold tracking-tight text-[#1B1D3A]">{title}</p>
        <p className="mx-auto mt-2 max-w-xl text-[#6B6F93]">
          {text ?? "Describe your product in one sentence and meet your guide in under two minutes. Try it on your real site before you pay."}
        </p>
        <Link
          href="/create"
          className="mt-5 inline-flex h-12 items-center rounded-full bg-[#1B1D3A] px-7 font-semibold text-white transition hover:bg-[#2f3263]"
        >
          Create your mascot
        </Link>
      </div>
    </aside>
  );
}
