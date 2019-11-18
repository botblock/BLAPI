/** 
 * This is a fallback type
 * to make BLAPI compatible with typescript code that does not use discord.js
 */
export class DiscordJSClientFallback {
  user?: {
    id: string;
    [k: string]: any;
  };
  shard?: {
    id: number;
    count: number;
    [k: string]: any;
  };
  guilds: Map<string, any>;
  [k: string]: any;
}
