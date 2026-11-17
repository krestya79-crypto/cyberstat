import { BookOpen } from 'lucide-react';
export const sourceUrl = (source: number, page?: number) =>
  `${import.meta.env.BASE_URL}lectures/lecture-${source}.pdf${page ? `#page=${page}` : ''}`;
export function SourceLink({
  lecture,
  page,
  label,
}: {
  lecture: number;
  page?: number;
  label?: string;
}) {
  return (
    <a className="source-link" href={sourceUrl(lecture, page)} target="_blank" rel="noreferrer">
      <BookOpen size={13} />
      {label ?? `Source ${lecture}${page ? ` · p. ${page}` : ''}`}
      <span className="sr-only"> (opens source PDF in a new tab)</span>
    </a>
  );
}
