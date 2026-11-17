import katex from 'katex';
export function MathText({ tex, block = false }: { tex: string; block?: boolean }) {
  try {
    return (
      <span
        className={block ? 'math-block' : 'math-inline'}
        dangerouslySetInnerHTML={{
          __html: katex.renderToString(tex, {
            displayMode: block,
            throwOnError: true,
            trust: false,
            output: 'htmlAndMathml',
            strict: 'error',
          }),
        }}
      />
    );
  } catch {
    return (
      <span role="alert">
        This mathematical expression could not be rendered. Please check the selected formula.
      </span>
    );
  }
}
