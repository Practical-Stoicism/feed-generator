import { AppContext } from '../config'
import {
  QueryParams,
  OutputSchema as AlgoOutput,
} from '../lexicon/types/app/bsky/feed/getFeedSkeleton'
import * as stoicFeed from './stoic-feed'

type AlgoHandler = (ctx: AppContext, params: QueryParams) => Promise<AlgoOutput>

const algos: Record<string, AlgoHandler> = {
  [stoicFeed.shortname]: stoicFeed.handler,
}

console.log('Registered algorithms:', Object.keys(algos))

export default algos
