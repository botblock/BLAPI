declare global {
  /**
   * This is a fallback type
   * to make BLAPI compatible with typescript code that does not use discord.js
   */
  class Collection<K, T> extends Map<K, T> {
    [key: string]: any;
  }

  /**
   * This is a fallback type
   * to make BLAPI compatible with typescript code that does not use discord.js
   */
  type DiscordJSClientFallback = {
    user: {
      id: string;
      [k: string]: any;
    } | null;

    shard:
      | ({
          count: number;
          [k: string]: any;
        } & (
          | { ids: number[] }
          | {
              id: number;
            }
        ))
      | null;

    guilds:
      | Collection<string, any>
      | {
          cache: Collection<string, any>;
        };

    [k: string]: any;
  };
}

export {};
