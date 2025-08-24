import { Collection, Filter, WithId, Document as BsonDocument } from "mongodb";
import { NextRequest } from "next/server";

interface PaginationResult<T> {
  data: WithId<T>[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function paginate<T extends BsonDocument>(
  request: NextRequest,
  collection: Collection<T>,
  query: Filter<T> = {},
  sort: any = { createdAt: -1 }
): Promise<PaginationResult<T>> {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = parseInt(url.searchParams.get("limit") || "10", 10);
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    collection.find(query).sort(sort).skip(skip).limit(limit).toArray(),
    collection.countDocuments(query),
  ]);

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
