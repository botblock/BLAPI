export type listData = {
  [listname: string]: {
    api_docs: string | null;
    api_post: string;
    api_field: string;
    api_shard_id: string | null;
    api_shard_count: string | null;
    api_shards: string | null;
    api_get: string | null;
  };
};
export type apiKeysObject = { [listname: string]: string };
