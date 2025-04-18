import { QueryParams } from '../lexicon/types/app/bsky/feed/getFeedSkeleton'
import { AppContext } from '../config'
import {Kysely} from "kysely";
import {DatabaseSchema} from "../db/schema";

// max 15 chars
export const shortname = 'whats-alf'

export const handler = async (ctx: {
  db: Kysely<DatabaseSchema>;
  cfg: {
    port: number;
    listenhost: string;
    sqliteLocation: string;
    subscriptionEndpoint: string;
    subscriptionReconnectDelay: number;
    hostname: string;
    publisherDid: string;
    serviceDid: string
  }
}, params: { cursor: string; limit: number }) => {
  let builder = ctx.db
    .selectFrom('post')
    .selectAll()
    .orderBy('indexedAt', 'desc')
    .orderBy('cid', 'desc')
    .limit(params.limit)

  if (params.cursor) {
    const timeStr = new Date(parseInt(params.cursor, 10)).toISOString()
    builder = builder.where('post.indexedAt', '<', timeStr)
  }
  const res = await builder.execute()

  const feed = res.map((row) => ({
    post: row.uri,
  }))

  let cursor: string | undefined
  const last = res.at(-1)
  if (last) {
    cursor = new Date(last.indexedAt).getTime().toString(10)
  }

  return {
    cursor,
    feed,
  }
}
