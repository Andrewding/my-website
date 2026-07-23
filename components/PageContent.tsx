// Renders the simple "blank line = paragraph, '## ' = heading" content
// format used by the `pages` table. Intentionally not a full markdown
// parser — keeps the admin textarea predictable and this renderer has
// zero dependencies.
export default function PageContent({ content }: { content: string }) {
  const blocks = content.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);

  return (
    <>
      {blocks.map((block, i) => {
        if (block.startsWith("## ")) {
          return (
            <h2 key={i} className="font-display text-lg font-semibold mt-8 mb-3">
              {block.slice(3)}
            </h2>
          );
        }
        return (
          <p key={i} className="text-muted leading-relaxed mb-4 whitespace-pre-line">
            {block}
          </p>
        );
      })}
    </>
  );
}
