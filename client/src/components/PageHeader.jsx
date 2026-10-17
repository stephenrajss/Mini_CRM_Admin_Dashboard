import { usePageMeta } from '../context/PageMetaContext';

export function PageHeader(props) {
  const { title, description, actions } = props;

  usePageMeta(title);
  
  return (
    <div className="mb-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
        {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export default PageHeader;