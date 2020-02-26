/**
 * This is a fallback type
 * to make BLAPI compatible with typescript code that does not use discord.js
 */
export default class DiscordJSClientFallback {
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
    | Map<string, any>
    | {
        cache: Map<string, any>;
      };

  [k: string]: any;
}
