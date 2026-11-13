import type { QueryCtx } from "./_generated/server";

type Row = Record<string, unknown> & { _id?: string };

// In-memory stand-in for ctx.db that supports collect(), withIndex() with
// eq/gte, and get(). Popularity rows are derived from userShoes when omitted.
export function mockQueryCtx(tables: Record<string, Row[]>): QueryCtx {
  const userShoes = tables.userShoes ?? [];
  const popularity =
    tables.popularity ??
    (tables.shoes ?? []).map((shoe) => ({
      shoeId: shoe._id,
      count: userShoes.filter((row) => row.shoeId === shoe._id).length,
    }));
  const data: Record<string, Row[]> = { ...tables, userShoes, popularity };

  const query = (table: string) => {
    const rows = data[table] ?? [];
    return {
      collect: async () => rows,
      withIndex: (_name: string, build: (q: unknown) => unknown) => {
        const predicates: Array<(row: Row) => boolean> = [];
        const q = {
          eq: (field: string, value: unknown) => (predicates.push((row) => row[field] === value), q),
          gte: (field: string, value: number) => (predicates.push((row) => (row[field] as number) >= value), q),
        };
        build(q);
        return { collect: async () => rows.filter((row) => predicates.every((p) => p(row))) };
      },
    };
  };

  const get = async (id: string) =>
    Object.values(data).flat().find((row) => row._id === id) ?? null;

  return { db: { query, get } } as unknown as QueryCtx;
}
