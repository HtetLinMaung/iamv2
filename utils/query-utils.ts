const parseValue = (v: string) =>
  !isNaN(parseInt(v, 10)) ? parseInt(v, 10) : v;

export const expressRequestQueryToPrismaQuery = (
  query: any,
  search_colums: string[]
) => {
  const prismaQuery: any = {
    where: { status: 1 },
    orderBy: [],
    skip: 0,
    take: 100,
    select: {},
  };
  if (query.page && query.per_page) {
    if (!isNaN(parseInt(query.per_page, 10))) {
      prismaQuery.take = parseInt(query.per_page, 10);
    }
    prismaQuery.skip = (query.page - 1) * query.per_page;
  }
  for (const key in query) {
    if (key === "sort_by") {
      const sortBy = query.sort_by.split(",");
      sortBy.forEach((sort: string) => {
        const order = sort.split(":")[1];
        const field = sort.split(":")[0];
        prismaQuery.orderBy.push({ [field]: order });
      });
    } else if (key === "select" || key === "projections") {
      const select = query[key].split(",");
      select.forEach((s: string) => {
        prismaQuery.select[s.split(" as ")[0]] = true;
      });
    } else if (
      ![
        "page",
        "per_page",
        "sort_by",
        "select",
        "projections",
        "search",
      ].includes(key)
    ) {
      const key_parts = key.split(":");
      if (key_parts.length > 1) {
        const k = key_parts[0];
        const operator = key_parts[1];

        if (operator === "between") {
          const values = query[k].split(",");

          prismaQuery.where[k] = {
            gte: values[0].match(/^\d{4}-\d{2}-\d{2}$/)
              ? new Date(values[0])
              : parseValue(values[0]),
            lte: values[1].match(/^\d{4}-\d{2}-\d{2}$/)
              ? new Date(values[1])
              : parseValue(values[1]),
          };
        } else if (operator === "in") {
          prismaQuery.where[k] = {
            in: query[k].split(",").map((v: string) => parseValue(v)),
          };
        } else {
          prismaQuery.where[k][operator] = parseValue(query[k]);
        }
      } else if (key_parts.length === 1) {
        prismaQuery.where[key] = !isNaN(parseInt(query[key], 10))
          ? parseInt(query[key], 10)
          : query[key];
      }
    } else if (key === "search") {
      search_colums.forEach((s: string) => {
        prismaQuery.where[s] = { contains: query.search };
      });
    }
  }
  return prismaQuery;
};

export const aliasData = (data: any[], select: string) => {
  if (!select) {
    return data;
  }
  return data.map((d: any) => {
    const selects = select.split(" as ");
    if (selects.length > 1 && selects[0].trim() !== selects[1].trim()) {
      d[selects[1].trim()] = d[selects[0].trim()];
      delete d[selects[0].trim()];
    }
    return d;
  });
};
