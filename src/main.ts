import { Response } from 'centra';
import type { Client } from 'discord.js';
import { get, post, UserLogger } from './requests';
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

// eslint doesnt like enums
// eslint-disable-next-line no-shadow
export enum LogLevel {
  None = 0x0000,
  ErrorOnly = 0x0010,
  WarnAndErrorOnly = 0x0020,
  All = 0x0030,
}

type LogOptions = {
  /**
   * @deprecated Use logLevel instead.
   *
   * If you want an equivalent to `extended: true`, use `logLevel: LogLevel.All`
   */
  extended?: boolean;

  /**
   * The log level to use
   * @default LogLevel.WarnAndErrorOnly
   */
  logLevel?: LogLevel;

  /**
   * Your custom logger to be used instead of the default console logger
   */
  logger?: UserLogger;
};

let listData = fallbackData as listDataType;
let legacyIds = legacyIdsFallbackData as legacyIdDataType;
const lastUpdatedListAt = new Date(1999); // some date that's definitely past
let useBotblockAPI = true;

let logLevel = LogLevel.WarnAndErrorOnly;

/**
 * the userLogger variable will later be defined with the
 *  logger supplied by the user if they supplied any
 */
// eslint-disable-next-line max-len
let userLogger: UserLogger | undefined;

function createBlapiMessage(message: string) {
  return `BLAPI: ${message}`;
}

const logger = {
  info: (msg: string) => {
    if (logLevel < LogLevel.All) {
      return;
    }
    if (userLogger) {
      userLogger.info(createBlapiMessage(msg));
    } else {
      // eslint-disable-next-line no-console
      console.info(createBlapiMessage(msg));
    }
  },
  warn: (msg: string) => {
    if (logLevel < LogLevel.WarnAndErrorOnly) {
      return;
    }
    if (userLogger) {
      userLogger.warn(createBlapiMessage(msg));
    } else {
      // eslint-disable-next-line no-console
      console.warn(createBlapiMessage(msg));
    }
  },
  error: (msg: string) => {
    if (logLevel < LogLevel.ErrorOnly) {
      return;
    }
    if (userLogger) {
      userLogger.error(createBlapiMessage(msg));
    } else {
      // eslint-disable-next-line no-console
      console.error(createBlapiMessage(msg));
    }
  },
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
    ...convertLegacyIds(apiKeys),
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
  if (!listData || lastUpdatedListAt < currentDate) {
    // we try to update the listdata every day
    // in case new lists are added but the code is not restarted
    lastUpdatedListAt.setDate(currentDate.getDate() + 1);
    try {
      const tmpListData = await get<listDataType>(
        'https://botblock.org/api/lists?filter=true',
        logger,
      );
      // make sure we only save it if nothing goes wrong
      if (tmpListData) {
        listData = tmpListData;
        logger.info('Updated list endpoints.');
      } else {
        logger.error('Got empty list of endpoints from botblock.');
      }
    } catch (e) {
      logger.error(String(e));
      logger.error(
        "Something went wrong when contacting BotBlock for the API of the lists, so we're using an older preset. Some lists might not be available because of this.",
      );
    }
    try {
      const tmpLegacyIdsData = await get<legacyIdDataType>(
        'https://botblock.org/api/legacy-ids',
        logger,
      );
      // make sure we only save it if nothing goes wrong
      if (tmpLegacyIdsData) {
        legacyIds = tmpLegacyIdsData;
        logger.info('Updated legacy Ids.');
      } else {
        logger.error('Got empty list of legacy Ids from botblock.');
      }
    } catch (e) {
      logger.error(String(e));
      logger.error(
        "Something went wrong when contacting BotBlock for legacy Ids, so we're using an older preset. Some lists might not be available because of this.",
      );
    }
  }

  const posts: Array<Promise<Response | { error: any }>> = [];

  const updatedApiKeys = convertLegacyIds(apiKeys);

  Object.entries(listData).forEach(([listname]) => {
    if (updatedApiKeys[listname] && listData[listname].api_post) {
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

      posts.push(post(apiPath, updatedApiKeys[listname], sendObj, logger));
    }
  });

  return Promise.all(posts);
}

async function runHandleInternalInSeconds(
  client: Client,
  apiKeys: apiKeysObject,
  repeatInterval: number,
  seconds: number,
): Promise<void> {
  setTimeout(
    /* eslint-disable-next-line no-use-before-define */
    () => handleInternal(client, apiKeys, repeatInterval),
    1000 * seconds,
  );
}

/**
 * @param client Discord.js client
 * @param apiKeys A JSON object formatted like: {"botlist name":"API Keys for that list", etc.}
 * @param repeatInterval Number of minutes between each repetition
 */
async function handleInternal(
  client: Client,
  apiKeys: apiKeysObject,
  repeatInterval: number,
  isFirstRun = false,
): Promise<void> {
  // call this function again in the next interval
  runHandleInternalInSeconds(client, apiKeys, repeatInterval, 60 * repeatInterval);

  if (client.user) {
    const client_id = client.user.id;
    let unchanged;
    let shard_count: number | undefined;
    let shards: Array<number> | undefined;
    let server_count = 0;
    let shard_id: number | undefined;
    // Checks if bot is sharded
    // Only run posting from shard 0
    if (client.shard?.ids.includes(0)) {
      shard_count = client.shard.count;
      shard_id = client.shard.ids.at(0); // this should always only be a single number

      // This will get as much info as it can, without erroring
      try {
        const guildSizes: Array<number> = await client.shard.broadcastEval(
          (broadcastedClient) => broadcastedClient.guilds.cache.size,
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
        logger.error(String(e));
        logger.error('Error while fetching shard server counts:');
      }
      // Checks if bot is sharded with internal sharding
    } else if (client.ws.shards.size > 1) {
      shard_count = client.ws.shards.size;
      // Get array of shards
      shards = client.ws.shards.map(
        (shard) => client.guilds.cache.filter((guild) => guild.shardId === shard.id).size,
      );

      if (shards.length !== client.ws.shards.size) {
        // If not all shards are up yet, we skip this run of handleInternal and try again later
        if (isFirstRun) {
          const secondsToWait = 10;
          logger.info(`Not all shards are up yet, so we're trying again in ${secondsToWait} seconds.`);
          runHandleInternalInSeconds(client, apiKeys, repeatInterval, secondsToWait);
          return;
        }
        logger.error('Not all shards are up yet, but this is not the first time we\'re trying so we will wait for the entire interval.');
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
          logger,
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
    if (isFirstRun) {
      const secondsToWait = 10;
      logger.info(`Discord client seems to not be connected yet, so we're trying again in ${secondsToWait} seconds.`);
      runHandleInternalInSeconds(client, apiKeys, repeatInterval, secondsToWait);
      return;
    }
    logger.error('Discord client seems to not be connected yet, but this is not the first time we\'re trying so we will wait for the entire interval.');
  }
}

/**
 * This function is for automated use with discord.js
 * @param discordClient Client via wich your code is connected to Discord
 * @param apiKeys A JSON object formatted like: {"botlist name":"API Keys for that list", etc.}
 * @param repeatInterval Number of minutes until you want to post again, leave out to use 30
 */
export function handle(
  discordClient: Client,
  apiKeys: apiKeysObject,
  repeatInterval?: number,
): Promise<void> {
  return handleInternal(
    discordClient,
    apiKeys,
    !repeatInterval || repeatInterval < 1 ? 30 : repeatInterval,
    true,
  );
}

/**
 * For when you don't use discord.js or just want to post to manual times
 * @param guildCount Integer value of guilds your bot is serving
 * @param botId Snowflake of the ID the user your bot is using
 * @param apiKeys A JSON object formatted like: {"botlist name":"API Keys for that list", etc.}
 * @param shardId (optional) The shard ID, which will be used to identify the
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
        logger,
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

export function setLogging(logOptions: LogOptions): void {
  if (
    typeof logOptions.logLevel === 'number'
  ) {
    logLevel = logOptions.logLevel;
  } else if (
    // backwards compatibility
    typeof logOptions.extended === 'boolean'
  ) {
    logLevel = logOptions.extended ? LogLevel.All : LogLevel.WarnAndErrorOnly;
  }
  // no logger supplied by user
  if (!Object.prototype.hasOwnProperty.call(logOptions, 'logger')) {
    return;
  }
  const passedLogger = logOptions.logger!; // we checked that it exists beforehand
  // making sure the logger supplied by the user has our required log levels (info, warn, error)
  if (
    typeof passedLogger.info !== 'function'
    || typeof passedLogger.warn !== 'function'
    || typeof passedLogger.error !== 'function'
  ) {
    throw new Error(
      'Your supplied logger does not seem to expose the log levels BLAPI needs to work. Make sure your logger offers the following methods: info() warn() error()',
    );
  }
  userLogger = passedLogger;
}

export function setBotblock(useBotblock: boolean): void {
  useBotblockAPI = useBotblock;
}
