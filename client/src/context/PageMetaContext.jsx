import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const PageMetaContext = createContext(null);

export function PageMetaProvider({ children }) {
  const [title, setTitle] = useState('Dashboard');
  const value = useMemo(() => ({ title, setTitle }), [title]);
  return (
    <PageMetaContext.Provider value={value}>
      {children}
    </PageMetaContext.Provider>
  );
}

export function usePageMeta(title) {
  const { setTitle } = useContext(PageMetaContext);
  
  useEffect(() => {
    setTitle(title);
    document.title = `${title} · Mini CRM`;
  }, [setTitle, title]);
}

export function usePageTitle() {
  const context = useContext(PageMetaContext);
  return context?.title || 'Mini CRM';
}
