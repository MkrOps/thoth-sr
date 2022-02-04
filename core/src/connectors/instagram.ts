// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { customConfig } from '@latitudegames/thoth-core/src/superreality/customConfig'
import { IgApiClient } from 'instagram-private-api'

import { database } from '../superreality/database'
import { handleInput } from '../superreality/handleInput'

export const createInstagramClient = async () => {
    const username = customConfig.instance.get('instagramUsername')
    const password = customConfig.instance.get('instagramPassword')
    if (!username || !password)
        return console.warn('No Instagram credentials found, skipping')

    //creates the instagram client and logs in using the credentials
    const ig = new IgApiClient()
    ig.state.generateDevice(username)

    await ig.simulate.preLoginFlow()
    const loggedInUser = await ig.account.login(username, password)
    process.nextTick(async () => await ig.simulate.postLoginFlow())

    const history = {
        pending: await ig.feed.directInbox().items(),
        unread: [],
    }

    for (const idx in history.pending) {
        const pending = history.pending[idx]
        if (pending.last_permanent_item.item_type === 'text') {
            await database.instance.messageExists(
                'instagram',
                pending.thread_id,
                pending.last_permanent_item.item_id + '',
                pending.last_permanent_item.user_id === loggedInUser.pk
                    ? customConfig.instance.get('botName')
                    : pending.thread_title,
                pending.last_permanent_item.text,
                parseInt(pending.last_permanent_item.timestamp) / 1000
            )
        }
    }

    setInterval(async () => {
        const inbox = {
            pending: await ig.feed.directInbox().items(),
        }

        for (const idx in inbox.pending) {
            const pending = inbox.pending[idx]
            if (pending.last_permanent_item.item_type === 'text') {
                if (pending.last_permanent_item.user_id === loggedInUser.pk) {
                    await database.instance.messageExists(
                        'instagram',
                        pending.thread_id,
                        pending.last_permanent_item.item_id + '',
                        pending.last_permanent_item.user_id === loggedInUser.pk
                            ? customConfig.instance.get('botName')
                            : pending.thread_title,
                        pending.last_permanent_item.text,
                        parseInt(pending.last_permanent_item.timestamp) / 1000
                    )

                    continue
                }

                await database.instance.messageExistsAsyncWitHCallback(
                    'instgram',
                    pending.thread_id,
                    pending.last_permanent_item.item_id + '',
                    pending.users[0].username,
                    pending.last_permanent_item.text,
                    parseInt(pending.last_permanent_item.timestamp),
                    () => {
                        const timestamp = parseInt(pending.last_permanent_item.timestamp)
                        const date = new Date(timestamp / 1000)
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

                        const resp = await handleInput(
                            pending.last_permanent_item.text,
                            pending.users[0].username,
                            customConfig.instance.get('agent') ?? 'Agent',
                            null,
                            'instagram',
                            pending.last_permanent_item.item_id
                        )

                        const thread = ig.entity.directThread(chatId)
                        await thread.broadcastText(resp)

                        database.instance.addMessageInHistoryWithDate(
                            'instagram',
                            pending.thread_id,
                            pending.last_permanent_item.item_id + '',
                            pending.users[0].username,
                            pending.last_permanent_item.text,
                            utcStr
                        )
                    }
                )
            }
        }
    }, 5000)
}
