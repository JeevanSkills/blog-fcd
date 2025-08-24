import { Collection, Document as BsonDocument } from "mongodb";
import { NextRequest } from "next/server";

interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function paginate<T extends BsonDocument>(
  request: NextRequest,
  collection: Collection<T>,
  pipeline: any[] = []
): Promise<PaginationResult<T>> {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = parseInt(url.searchParams.get("limit") || "10", 10);
  const skip = (page - 1) * limit;

  // Build paginated pipeline
  const paginatedPipeline = [
    ...pipeline,
    { $skip: skip },
    { $limit: limit },
  ];

  const [data, totalResult] = await Promise.all([
    collection.aggregate(paginatedPipeline).toArray() as Promise<T[]>,
    collection.aggregate([...pipeline, { $count: "count" }]).toArray(),
  ]);

  const total = totalResult[0]?.count || 0;

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
