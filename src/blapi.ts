import { get, post } from './bttps';
import { fallbackData } from './fallbackListData';
import Discord from 'discord.js'; // only for types
let listData: any; // TODO add type
const listAge = new Date();
let extendedLogging = false;
let useBotblockAPI = true;

// TODO in general: remove all "any" types and replace them by real types
// TODO type
type apiKeysObject = any;

/**
 * @param {Object} apiKeys A JSON object formatted like: {"botlist name":"API Keys for that list", etc.} ; it also includes other metadata including sharddata
 */
async function postToAllLists(apiKeys: apiKeysObject) {
  // make sure we have all lists we can post to and their apis
  const currentDate = new Date();
  if (!listData || listAge < currentDate) {
    listAge.setDate(currentDate.getDate() + 1); // we try to update the listdata every day, in case new lists are added but the code is not restarted
    try {
      const tmpListData = await get('https://botblock.org/api/lists');
      // make sure we only save it if nothing goes wrong
      if (tmpListData) {
        listData = tmpListData;
      } else {
        throw new Error('Got empty list from botblock.');
      }
    } catch (e) {
      console.error(`BLAPI: ${e}`);
      console.error(
        "BLAPI : Something went wrong when contacting BotBlock for the API of the lists, so we're using an older preset. Some lists might not be available because of this."
      );
    }
  }
  for (const listname in listData) {
    if (
      apiKeys[listname] &&
      (listData[listname]['api_post'] || listname === 'discordbots.org')
    ) {
      // we even need to check this extra because botblock gives us nulls back
      let list = listData[listname];
      if (listname === 'discordbots.org') {
        list = fallbackData[listname];
      }
      const apiPath = list.api_post.replace(':id', apiKeys.bot_id);
      // creating JSON object to send, reading out shard data
      const sendObj: any = {}; // TODO type
      sendObj[list.api_field] = apiKeys.server_count;
      if (apiKeys.shard_id && list.api_shard_id) {
        sendObj[list.api_shard_id] = apiKeys.shard_id;
      }
      if (apiKeys.shard_count && list.api_shard_count) {
        sendObj[list.api_shard_count] = apiKeys.shard_count;
      }
      if (apiKeys.shards && list.api_shards) {
        sendObj[list.api_shards] = apiKeys.shards;
      }

      post(apiPath, apiKeys[listname], sendObj, extendedLogging).catch(e =>
        console.error(`BLAPI: ${e}`)
      );
    }
  }
}

/**
 * @param client Discord.js client
 * @param apiKeys A JSON object formatted like: {"botlist name":"API Keys for that list", etc.}
 * @param repeatInterval Number of minutes between each repetition
 */
async function handleInternal(
  client: Discord.Client,
  apiKeys: apiKeysObject,
  repeatInterval: number
) {
  setTimeout(
    handleInternal.bind(null, client, apiKeys, repeatInterval),
    60000 * repeatInterval
  ); // call this function again in the next interval
  let unchanged;

  if (client.user) {
    /* eslint-disable camelcase */
    apiKeys.bot_id = client.user.id;

    // Checks if bot is sharded
    if (client.shard && client.shard.id === 0) {
      apiKeys.shard_count = client.shard.count;

      // This will get as much info as it can, without erroring
      try {
        const _ = await client.shard.broadcastEval('this.guilds.size');
        const shardCounts = _.filter(count => count !== 0);
        if (shardCounts.length !== client.shard.count) {
          // If not all shards are up yet, we skip this run of handleInternal
          return;
        }
        apiKeys.shards = shardCounts;
        apiKeys.server_count = apiKeys.shards.reduce(
          (prev: number, val: number) => prev + val,
          0
        );
      } catch (e) {
        console.error('BLAPI: Error while fetching shard server counts:', e);
      }
      // Checks if bot is sharded with internal sharding
    } else if (!client.shard) {
      /*
         else if (client.ws && client.ws.shards) {
          apiKeys.shard_count = client.ws.shards.size;
          // Get array of shards
          const shardCounts:Array<number> = [];
          client.ws.shards.forEach(shard => {
            let count = 0;
            client.guilds.forEach(g => {
              if (g.shardID === shard.id) count++;
            });
            shardCounts.push(count);
          });
          if (shardCounts.length !== client.ws.shards.size) {
            // If not all shards are up yet, we skip this run of handleInternal
            console.log(
              "BLAPI: Not all shards are up yet, so we're skipping this run."
            );
            return;
          }
          apiKeys.shards = shardCounts;
          apiKeys.server_count = apiKeys.shards.reduce(
            (prev:number, val:number) => prev + val,
            0
          );
          // Check if bot is not sharded at all, but still wants to send server count (it's recommended to shard your bot, even if it's only one shard)
        }*/
      apiKeys.server_count = client.guilds.size;
    } else {
      unchanged = true;
    } // nothing has changed, therefore we don't send any data
    /* eslint-enable camelcase */
    if (!unchanged) {
      if (repeatInterval > 2 && useBotblockAPI) {
        // if the interval isnt below the BotBlock ratelimit, use their API
        post(
          'https://botblock.org/api/count',
          'no key needed for this',
          apiKeys,
          extendedLogging
        ).catch(e => console.error(`BLAPI: ${e}`));

        // they blacklisted botblock, so we need to do this, posting their stats manually
        if (apiKeys['discordbots.org']) {
          const newApiKeys: apiKeysObject = {};
          /* eslint-disable camelcase */
          newApiKeys.bot_id = apiKeys.bot_id;
          newApiKeys['discordbots.org'] = apiKeys['discordbots.org'];
          newApiKeys.server_count = apiKeys.server_count;
          if (apiKeys.shard_count) {
            newApiKeys.shard_count = apiKeys.shard_count;
          }
          if (apiKeys.shards) {
            newApiKeys.shards = apiKeys.shards;
          }
          /* eslint-enable camelcase */
          postToAllLists(newApiKeys);
        }
      } else {
        postToAllLists(apiKeys);
      }
    }
  } else {
    console.error(
      `BLAPI : Discord client seems to not be connected yet, so we're skipping this run of the post. We will try again in ${repeatInterval} minutes.`
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
  discordClient: Discord.Client,
  apiKeys: apiKeysObject,
  repeatInterval: number
) {
  // handle inputs
  if (!repeatInterval || repeatInterval < 1) repeatInterval = 30;
  handleInternal(discordClient, apiKeys, repeatInterval);
}

/**
 * For when you don't use discord.js or just want to post to manual times
 * @param guildCount Integer value of guilds your bot is serving
 * @param botID Snowflake of the ID the user your bot is using
 * @param apiKeys A JSON object formatted like: {"botlist name":"API Keys for that list", etc.}
 * @param shardID (optional) The shard ID, which will be used to identify the shards valid for posting (and for super efficient posting with BLAPIs own distributer when not using botBlock)
 * @param shardCount (optional) The number of shards the bot has, which is posted to the lists
 * @param shards (optional) An array of guild counts of each single shard (this should be a complete list, and only a single shard will post it)
 */
export function manualPost(
  guildCount: number,
  botID: string,
  apiKeys: apiKeysObject,
  shardID: number,
  shardCount: number,
  shards: Array<number>
) {
  /* eslint-disable camelcase */
  apiKeys.bot_id = botID;
  apiKeys.server_count = guildCount;
  // check if we want to use sharding
  if (shardID === 0 || (shardID && !shards)) {
    // if we don't have all the shard info in one place well try to post every shard itself
    apiKeys.shard_id = shardID;
    apiKeys.shard_count = shardCount;
    if (shards) {
      if (shards.length !== shardCount) {
        console.error(
          `BLAPI: Shardcount (${shardCount}) does not equal the length of the shards array (${shards.length}).`
        );
        return;
      }
      apiKeys.shards = shards;
      apiKeys.server_count = apiKeys.shards.reduce(
        (prev: number, val: number) => prev + val,
        0
      );
    }
    /* eslint-enable camelcase */
  }
  if (useBotblockAPI) {
    post(
      'https://botblock.org/api/count',
      'no key needed for this',
      apiKeys,
      extendedLogging
    ).catch(e => console.error(`BLAPI: ${e}`));
  } else {
    postToAllLists(apiKeys);
  }
}

export function setLogging(setLogging: boolean) {
  extendedLogging = setLogging;
}

export function setBotblock(useBotblock: boolean) {
  useBotblockAPI = useBotblock;
}
