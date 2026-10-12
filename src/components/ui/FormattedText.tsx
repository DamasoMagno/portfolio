import ReactMarkdown from "react-markdown";

export function FormattedText({ text }: { text: string }) {
  return <div className="space-y-4 break-words text-base leading-7 text-text-secondary [&_p]:whitespace-pre-wrap [&_li]:whitespace-pre-wrap [&_strong]:font-semibold [&_strong]:text-text-primary [&_a]:text-primary [&_a]:underline [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5 [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-lg [&_h3]:font-semibold [&_blockquote]:border-l-2 [&_blockquote]:border-primary/40 [&_blockquote]:pl-4 [&_pre]:overflow-x-auto [&_code]:font-mono [&_code]:text-sm">
    <ReactMarkdown skipHtml disallowedElements={["img"]} components={{ a: ({ node, ...props }) => <a {...props} rel="noopener noreferrer" /> }}>{text}</ReactMarkdown>
  </div>;
}
