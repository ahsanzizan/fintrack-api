export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    lastPage: number;
    currentPage: number;
    perPage: number;
    prev: number | null;
    next: number | null;
  };
}

export type PaginateOptions = {
  perPage?: number | string;
};
export type PaginateFunction = <T, K>(
  model: any,
  page?: number,
  args?: K,
) => Promise<PaginatedResult<T>>;

export const paginator = (perPage: number): PaginateFunction => {
  return async (model, page?, args: any = {}) => {
    const currentPage = Number(page) || 1; // Default page to 1
    const currentPerPage = Number(perPage) || 10; // Default records count per-page to 10

    const skip = currentPage > 0 ? currentPerPage * (currentPage - 1) : 0;
    const [total, data] = await Promise.all([
      model.count({ where: args.where }),
      model.findMany({
        ...args,
        take: currentPerPage,
        skip,
      }),
    ]);

    const lastPage = Math.ceil(total / currentPerPage);

    return {
      data,
      meta: {
        total,
        lastPage,
        currentPage: currentPage,
        perPage: currentPerPage,
        prev: currentPage > 1 ? currentPage - 1 : null,
        next: currentPage < lastPage ? currentPage + 1 : null,
      },
    };
  };
};
