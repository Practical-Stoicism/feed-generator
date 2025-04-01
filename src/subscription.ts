import {
  OutputSchema as RepoEvent,
  isCommit,
} from './lexicon/types/com/atproto/sync/subscribeRepos'
import { FirehoseSubscriptionBase, getOpsByType } from './util/subscription'
import {sql} from "kysely";
import {isStoicContent} from "./util/stoic-identifiers";

export class FirehoseSubscription extends FirehoseSubscriptionBase {

  constructor(db: any, subscriptionEndpoint: string) {
    super(db, subscriptionEndpoint);
  }

  async handleEvent(evt: RepoEvent) {
    if (!isCommit(evt)) return;

    const ops = await getOpsByType(evt);

    const postsToDelete = ops.posts.deletes.map((del) => del.uri);
    const postsToCreate = ops.posts.creates
      .filter((create) => {
        const matches = isStoicContent(create.record.text);
        return matches;
      })
      .map((create) => ({
        uri: create.uri,
        cid: create.cid,
        indexedAt: new Date().toISOString(),
        isStoic: isStoicContent(create.record.text) ? 1 : 0,
        text: create.record.text,
      }));

    if (postsToDelete.length > 0) {
      await this.db
        .deleteFrom('post')
        .where('uri', 'in', postsToDelete)
        .execute();
    }

    if (postsToCreate.length > 0) {
      await this.db
        .insertInto('post')
        .values(postsToCreate)
        .onConflict((oc) => oc.doNothing())
        .execute();
    }
  }
}
