/* eslint-disable no-console */
/* eslint-disable prefer-const */
/* eslint-disable no-invalid-this */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable camelcase */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { TwitterApi } from 'twitter-api-v2'

import { database } from './database'
import { handleInput } from './handleInput'
import { getSetting } from './utils'

export class twitter_client {
  async handleMessage(response, chat_id, args, twitterV1) {
    if (args === 'DM') {
      await twitterV1.v1.sendDm({
        recipient_id: chat_id,
        text: response,
      })
    } else if (args === 'Twit') {
      await twitterV1.v1.reply(response, chat_id)
    }
  }

  agent
  settings

  createTwitterClient = async (agent, settings) => {
    this.agent = agent
    this.settings = settings

<<<<<<< HEAD
    const bearerToken = getSetting(settings, 'twitter_token')
    const twitterUser = getSetting(settings, 'twitter_id')
    const twitterAppToken = getSetting(settings, 'twitter_app_token')
    const twitterAppTokenSecret = getSetting(settings, 'twitter_app_token_secret')
    const twitterAccessToken = getSetting(settings, 'twitter_access_token')
    const twitterAccessTokenSecret = getSetting(
      settings,
      'twitter_access_token_secret'
    )
=======
    const bearerToken = settings['twitterBearerToken']
    const twitterUser = settings['twitterID']
    const twitterAppToken = settings['twitterAppToken']
    const twitterAppTokenSecret = settings['twitterAppTokenSecret']
    const twitterAccessToken = settings['tiwtterAccessToken']
    const twitterAccessTokenSecret = settings['twitterAccessTokenSecret']
>>>>>>> e2cca8b3 (fixed issues and errors for twilio/twitter)
    const regex = new RegExp('', 'ig')
    const regex2 = new RegExp(settings['botNameRegex'], 'ig')
    if (!bearerToken || !twitterUser)
      return console.warn('No API token for Whatsapp bot, skipping')

    let twitter = new TwitterApi(bearerToken)
    let twitterV1 = new TwitterApi({
      appKey: twitterAppToken,
      appSecret: twitterAppTokenSecret,
      accessToken: twitterAccessToken,
      accessSecret: twitterAccessTokenSecret,
    })
    const client = twitter.readWrite
    const localUser = await twitter.v2.userByUsername(twitterUser)

    new twitterPacketHandler(
      new TwitterApi(bearerToken),
      new TwitterApi({
        appKey: twitterAppToken,
        appSecret: twitterAppTokenSecret,
        accessToken: twitterAccessToken,
        accessSecret: twitterAccessTokenSecret,
      }),
      localUser
    )

    setInterval(async () => {
      const tv1 = new TwitterApi({
        appKey: twitterAppToken,
        appSecret: twitterAppTokenSecret,
        accessToken: twitterAccessToken,
        accessSecret: twitterAccessTokenSecret,
      })
      const eventsPaginator = await tv1.v1.listDmEvents()
      for await (const event of eventsPaginator) {
        console.log(
          'Event: ' + JSON.stringify(event.message_create.message_data.text)
        )
        if (event.type == 'message_create') {
          if (event.message_create.sender_id == localUser.data.id) {
            console.log('same sender')
            return
          }

          let authorName = 'unknown'
          const author = await twitter.v2.user(event.message_create.sender_id)
          if (author) authorName = author.data.username

          const resp = await handleInput(
            event.message_create.message_data.text,
            authorName,
            this.settings['Agent_Name'] ?? 'Agent',
            'twitter',
            event.id,
            this.settings['entity'],
            this.settings['spell_handler'],
            this.settings['spell_version']
          )
          this.handleMessage(resp, event.id, 'DM', tv1)
        }
      }
    }, 25000)
    if (!twit.data.text.match(regex2)) {
      const rules = await client.v2.streamRules()
      if (rules.data?.length) {
        await client.v2.updateStreamRules({
          delete: { ids: rules.data.map(rule => rule.id) },
        })
      }
      const tweetRules = this.settings['TWITTER_TWEET_RULES'].split(',')
      const _rules = []
      for (let x in tweetRules) {
        console.log('rule: ' + tweetRules[x])
        _rules.push({ value: tweetRules[x] })
      }
      await client.v2.updateStreamRules({
        add: _rules,
      })
      const stream = await client.v2.searchStream({
        'tweet.fields': ['referenced_tweets', 'author_id'],
        expansions: ['referenced_tweets.id'],
      })
      stream.autoReconnect = true
      stream.on(ETwitterStreamEvent.Data, async twit => {
        const isARt =
          twit.data.referenced_tweets?.some(
            twit => twit.type === 'retweeted'
          ) ?? false
        if (
          isARt ||
          (localUser !== undefined && twit.data.author_id == localUser.data.id)
        ) {
          console.log('isArt found')
        } else {
          if (!twit.data.text.match(regex)) {
            console.log('regex doesnt match')
          } else {
            let authorName = 'unknown'
            const author = await twitter.v2.user(twit.data.author_id)
            if (author) authorName = author.data.username
            let date = new Date()
            if (twit.data.created_at) date = new Date(twit.data.created_at)
            const utc = new Date(
              date.getUTCFullYear(),
              date.getUTCMonth(),
              date.getUTCDate(),
              date.getUTCHours(),
              date.getUTCMinutes(),
              date.getUTCSeconds()
            )
            const utcStr =
              date.getDate() +
              '/' +
              (date.getMonth() + 1) +
              '/' +
              date.getFullYear() +
              ' ' +
              utc.getHours() +
              ':' +
              utc.getMinutes() +
              ':' +
              utc.getSeconds()
            let ts = Math.floor(utc.getTime() / 1000)

            console.log('sending twit: ' + JSON.stringify(twit))
            const resp = handleInput(
              twit.data.text,
              authorName,
              this.settings['Agent_Name'] ?? 'Agent',
              'twitter',
              twit.data.id,
              this.settings['entity'],
              this.settings['spell_handler'],
              this.settings['spell_version']
            )

            this.handleMessage(resp, twit.data.id, 'Twit', twitterV1)
          }
        }
      })
    }
  }
}
