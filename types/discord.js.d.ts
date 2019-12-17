/**
 * This is a fallback type
 * to make BLAPI compatible with typescript code that does not use discord.js
 */
export default class DiscordJSClientFallback {
  user: {
    id: string;
    [k: string]: any;
  } | null;

  shard: {
    ids: number[];
    count: number;
    [k: string]: any;
  } | null;

  guilds: Map<string, any>;

  [k: string]: any;
}
