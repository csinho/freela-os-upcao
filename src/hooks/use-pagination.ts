import { useEffect, useMemo, useState } from "react";

export const MOBILE_PAGE_SIZE = 10;

export function usePagination<T>(items: T[], pageSize = MOBILE_PAGE_SIZE, resetKey?: string | number) {
  const [page, setPage] = useState(0);

  useEffect(() => {
    setPage(0);
  }, [resetKey]);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  const safePage = Math.min(page, totalPages - 1);

  const slice = useMemo(() => {
    const start = safePage * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, safePage, pageSize]);

  return {
    page: safePage,
    totalPages,
    pageItems: slice,
    totalItems: items.length,
    hasPrev: safePage > 0,
    hasNext: safePage < totalPages - 1,
    goPrev: () => setPage((p) => Math.max(0, p - 1)),
    goNext: () => setPage((p) => Math.min(totalPages - 1, p + 1)),
    reset: () => setPage(0),
  };
}
