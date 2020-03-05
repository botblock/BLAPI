declare global {
  type listDataType = {
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
  type legacyIdDataType = {
    [listname: string]: string;
  };
  type apiKeysObject = { [listname: string]: string };
}

export {};
