import { Response } from 'centra';
import { get, post } from './bttps';
import fallbackData from './fallbackListData';
import legacyIdsFallbackData from './legacyIdsFallbackData';

/* We moved types here to support both TS and JS bots
Importing would make JS fail for modules it can't use
Declaring global fails exporting some types, so TS will fail in that case */
type listDataType = {
  [listname: string]: {
    api_docs: string | null;
    api_post: string | null;
    api_field: string | null;
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
  guilds: {
    cache: Collection<string, { shardID: number; [k: string]: any }>;
  };
  ws: {
    shards: Collection<number, { id: number; [k: string]: any }>;
    [k: string]: any;
  };
  [k: string]: any;
};

let listData = fallbackData as listDataType;
let legacyIds = legacyIdsFallbackData as legacyIdDataType;
const listAge = new Date();
let extendedLogging = false;
let useBotblockAPI = true;
/**
 * this will later be defined with the logger supplied
 * by the user if they supplied any
 */
// eslint-disable-next-line max-len
let userLogger: { info: (arg0: string) => void; warn: (arg0: string) => void; error: (arg0: any) => void; };

const log = {
  info: (msg: string) => (userLogger ? userLogger.info(msg) : console.info(`[INFO] BLAPI: ${msg}`)),
  warn: (msg: string) => (userLogger ? userLogger.warn(msg) : console.warn(`[WARN] BLAPI: ${msg}`)),
  error: (err: any) => (userLogger ? userLogger.error(err) : console.error(`[ERROR] BLAPI ${err}`)),
};


function convertLegacyIds(apiKeys: apiKeysObject) {
  const newApiKeys: apiKeysObject = { ...apiKeys };
  Object.entries(legacyIds).forEach(([list, newlist]) => {
    if (newApiKeys[list]) {
      newApiKeys[newlist] = newApiKeys[list];
      delete newApiKeys[list];
    }
  });
  return newApiKeys;
}

function buildBotblockData(
  apiKeys: apiKeysObject,
  bot_id: string,
  server_count: number,
  shard_id?: number,
  shard_count?: number,
  shards?: Array<number>,
) {
  return {
    ...apiKeys,
    bot_id,
    server_count,
    shard_id,
    shard_count,
    shards,
  };
}

/**
 * @param apiKeys A JSON object formatted like: {"botlist name":"API Keys for that list", etc.} ;
 * it also includes other metadata including sharddata
 */
async function postToAllLists(
  apiKeys: apiKeysObject,
  client_id: string,
  server_count: number,
  shard_id?: number,
  shard_count?: number,
  shards?: Array<number>,
): Promise<Array<Response | { error: any }>> {
  // make sure we have all lists we can post to and their apis
  const currentDate = new Date();
  if (!listData || listAge < currentDate) {
    // we try to update the listdata every day
    // in case new lists are added but the code is not restarted
    listAge.setDate(currentDate.getDate() + 1);
    try {
      const tmpListData = await get<listDataType>(
        'https://botblock.org/api/lists?filter=true',
      );
      // make sure we only save it if nothing goes wrong
      if (tmpListData) {
        listData = tmpListData;
        log.info('Updated list endpoints.');
      } else {
        log.error('Got empty list of endpoints from botblock.');
      }
    } catch (e) {
      log.error(e);
      log.error(
        "Something went wrong when contacting BotBlock for the API of the lists, so we're using an older preset. Some lists might not be available because of this.",
      );
    }
    try {
      const tmpLegacyIdsData = await get<legacyIdDataType>(
        'https://botblock.org/api/legacy-ids',
      );
      // make sure we only save it if nothing goes wrong
      if (tmpLegacyIdsData) {
        legacyIds = tmpLegacyIdsData;
        log.info('Updated legacy Ids.');
      } else {
        log.error('Got empty list of legacy Ids from botblock.');
      }
    } catch (e) {
      log.error(e);
      log.error(
        "Something went wrong when contacting BotBlock for legacy Ids, so we're using an older preset. Some lists might not be available because of this.",
      );
    }
  }

  const posts: Array<Promise<Response | { error: any }>> = [];

  Object.entries(listData).forEach(([listname]) => {
    if (apiKeys[listname] && listData[listname].api_post) {
      const list = listData[listname];
      if (!list.api_post || !list.api_field) {
        return;
      }
      const apiPath = list.api_post.replace(':id', client_id);
      const sendObj: { [key: string]: any } = {};
      sendObj[list.api_field] = server_count;
      if (shard_id && list.api_shard_id) {
        sendObj[list.api_shard_id] = shard_id;
      }
      if (shard_count && list.api_shard_count) {
        sendObj[list.api_shard_count] = shard_count;
      }
      if (shards && list.api_shards) {
        sendObj[list.api_shards] = shards;
      }

      posts.push(post(apiPath, apiKeys[listname], sendObj, extendedLogging, userLogger));
    }
  });

  return Promise.all(posts);
}

/**
 * @param client Discord.js client
 * @param apiKeys A JSON object formatted like: {"botlist name":"API Keys for that list", etc.}
 * @param repeatInterval Number of minutes between each repetition
 */
async function handleInternal(
  client: DiscordJSClientFallback,
  apiKeys: apiKeysObject,
  repeatInterval: number,
): Promise<void> {
  setTimeout(
    /* eslint-disable-next-line @typescript-eslint/no-misused-promises */
    handleInternal.bind(null, client, apiKeys, repeatInterval),
    60000 * repeatInterval,
  ); // call this function again in the next interval
  if (client.user) {
    const client_id = client.user.id;
    let unchanged;
    let shard_count: number | undefined;
    let shards: Array<number> | undefined;
    let server_count = 0;
    let shard_id: number | undefined;
    // Checks if bot is sharded
    if (client.shard && client.shard.id === 0) {
      shard_count = client.shard.count;
      shard_id = client.shard.id;

      // This will get as much info as it can, without erroring
      try {
        const guildSizes: Array<number> = await client.shard.broadcastEval(
          'this.guilds.cache.size',
        );
        const shardCounts = guildSizes.filter((count: number) => count !== 0);
        if (shardCounts.length !== client.shard.count) {
          // If not all shards are up yet, we skip this run of handleInternal
          return;
        }
        server_count = shardCounts.reduce(
          (prev: number, val: number) => prev + val,
          0,
        );
      } catch (e) {
        log.error(e);
        log.error('Error while fetching shard server counts:');
      }
      // Checks if bot is sharded with internal sharding
    } else if (client.ws.shards.size > 1) {
      shard_count = client.ws.shards.size;
      // Get array of shards, loosing collection typings make this somewhat ugly
      shards = client.ws.shards.map(
        (s: { id: number }) => client.guilds.cache.filter(
          (g: { shardID: number }) => g.shardID === s.id,
        ).size,
      ) as Array<number>;
      if (shards.length !== client.ws.shards.size) {
        // If not all shards are up yet, we skip this run of handleInternal
        log.info(
          "Not all shards are up yet, so we're skipping this run.",
        );
        return;
      }
      server_count = shards.reduce(
        (prev: number, val: number) => prev + val,
        0,
      );
      // Check if bot is not sharded at all, but still wants to send server count
      // (it's recommended to shard your bot, even if it's only one shard)
    } else if (!client.shard) {
      server_count = client.guilds.cache.size;
    } else {
      unchanged = true;
    } // nothing has changed, therefore we don't send any data
    if (!unchanged) {
      if (repeatInterval > 2 && useBotblockAPI) {
        // if the interval isnt below the BotBlock ratelimit, use their API
        await post(
          'https://botblock.org/api/count',
          'no key needed for this',
          buildBotblockData(
            apiKeys,
            client_id,
            server_count,
            shard_id,
            shard_count,
            shards,
          ),
          extendedLogging,
          log,
        );

        // they blacklisted botblock, so we need to do this, posting their stats manually
        if (apiKeys['top.gg']) {
          await postToAllLists(
            { 'top.gg': apiKeys['top.gg'] },
            client_id,
            server_count,
            shard_id,
            shard_count,
            shards,
          );
        }
      } else {
        await postToAllLists(
          apiKeys,
          client_id,
          server_count,
          shard_id,
          shard_count,
          shards,
        );
      }
    }
  } else {
    log.error(
      `Discord client seems to not be connected yet, so we're skipping this run of the post. We will try again in ${repeatInterval} minutes.`,
    );
  }
}

/**
 * This function is for automated use with discord.js
 * @param discordClient Client via wich your code is connected to Discord
 * @param apiKeys A JSON object formatted like: {"botlist name":"API Keys for that list", etc.}
 * @param repeatInterval Number of minutes until you want to post again, leave out to use 30
 */
export function handle(
  discordClient: DiscordJSClientFallback,
  apiKeys: apiKeysObject,
  repeatInterval?: number,
): Promise<void> {
  return handleInternal(
    discordClient,
    convertLegacyIds(apiKeys),
    !repeatInterval || repeatInterval < 1 ? 30 : repeatInterval,
  );
}

/**
 * For when you don't use discord.js or just want to post to manual times
 * @param guildCount Integer value of guilds your bot is serving
 * @param botID Snowflake of the ID the user your bot is using
 * @param apiKeys A JSON object formatted like: {"botlist name":"API Keys for that list", etc.}
 * @param shardID (optional) The shard ID, which will be used to identify the
 * shards valid for posting
 * (and for super efficient posting with BLAPIs own distributer when not using botBlock)
 * @param shardCount (optional) The number of shards the bot has, which is posted to the lists
 * @param shards (optional) An array of guild counts of each single shard
 *  (this should be a complete list, and only a single shard will post it)
 */
export async function manualPost(
  guildCount: number,
  botID: string,
  apiKeys: apiKeysObject,
  shard_id?: number,
  shard_count?: number,
  shards?: Array<number>,
): Promise<Array<Response | { error: any }>> {
  const updatedApiKeys = convertLegacyIds(apiKeys);
  const client_id = botID;
  let server_count = guildCount;
  // check if we want to use sharding
  if (shard_id === 0 || (shard_id && !shards)) {
    // if we don't have all the shard info in one place well try to post every shard itself
    if (shards) {
      if (shards.length !== shard_count) {
        throw new Error(
          `BLAPI: Shardcount (${shard_count}) does not equal the length of the shards array (${shards.length}).`,
        );
      }
      server_count = shards.reduce(
        (prev: number, val: number) => prev + val,
        0,
      );
    }
  }
  const responses: Array<Response | { error: any }> = [];

  if (useBotblockAPI) {
    responses.push(
      await post(
        'https://botblock.org/api/count',
        'no key needed for this',
        buildBotblockData(
          updatedApiKeys,
          client_id,
          server_count,
          shard_id,
          shard_count,
          shards,
        ),
        extendedLogging,
        log,
      ),
    );
    if (updatedApiKeys['top.gg']) {
      responses.concat(
        await postToAllLists(
          { 'top.gg': updatedApiKeys['top.gg'] },
          client_id,
          server_count,
          shard_id,
          shard_count,
          shards,
        ),
      );
    }
  } else {
    responses.concat(
      await postToAllLists(
        updatedApiKeys,
        client_id,
        server_count,
        shard_id,
        shard_count,
        shards,
      ),
    );
  }
  return responses;
}

export function setLogging(logOptions: boolean | { extended?: boolean, logger?: any }): void {
  extendedLogging = false;
  if (typeof logOptions === 'boolean' && logOptions === true) extendedLogging = true;
  if (typeof logOptions === 'object' && Object.prototype.hasOwnProperty.call(logOptions, 'extended') && logOptions.extended === true) extendedLogging = true;
  // no logger supplied by user
  if (!Object.prototype.hasOwnProperty.call(logOptions, 'logger')) return;
  // making sure the logger supplied by the user has our required log levels (info, warn, error)
  // @ts-ignore
  if ((typeof logOptions.logger.info !== 'function') || (typeof logOptions.logger.warn !== 'function') || (typeof logOptions.logger.error !== 'function')) throw new Error('Your supplied logger does not seem to expose the log levels BLAPI needs to work. Make sure your logger offers the following methods: info() warn() error()');
  // @ts-ignore
  userLogger = logOptions.logger;
}

export function setBotblock(useBotblock: boolean): void {
  useBotblockAPI = useBotblock;
}
