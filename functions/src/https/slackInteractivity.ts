import * as functions from 'firebase-functions'
import {verifySlackPostRequest} from './utils/verifySlackPostRequest'
import fetch from 'node-fetch'
import {getSound} from '../common/soundCollections'
import {Sound} from '../interfaces/Sound'
import {twitterUpload} from '../twitter-cron/twitterCron'

const TYPE_BLOCK_ACTIONS = "block_actions"

export const slackInteractivity = functions.https.onRequest(async (request, response) => {
    const token = await verifySlackPostRequest(request, response)
    if (!token) {
        return
    }

    const payload = (JSON.parse(request.body.payload))
    const type = payload.type
    const channelId = payload.channel.id
    const responseUrl = payload.response_url
    const selectedFile = payload.actions ? payload.actions[0].value : null

    if (type !== TYPE_BLOCK_ACTIONS) {
        console.log("Received a not implemented type " + type)
        return response.status(501).send('Type not implemented')
    }
    if (!channelId) {
        console.log("No channel id")
        return response.status(400).send('Missing channel id')
    }
    if (!responseUrl) {
        console.log("No response_url")
        return response.status(400).send('Missing response_url')
    }
    if (!selectedFile) {
        console.log("No selected file or action not supported")
        return response.status(400).send('Missing supported action')
    }

    response
        .status(200)
        .send("✅  Ça arrive !")

    const tweetLink = await getTweetLink(selectedFile)

    return fetch(responseUrl, {
        method: "POST",
        body: JSON.stringify({
            delete_original: true,
            replace_original: false,
            response_type: 'in_channel',
            text: tweetLink,
            unfurl_media: true,
            unfurl_link: true,
        })
    })
})

type TweetLink = string
const getTweetLink = async (selectedFile: string): Promise<TweetLink> => {
    const sound = await getSound(selectedFile)

    if (sound && sound.tweetId) {
        return constructTweetLink(sound)
    }

    await twitterUpload(selectedFile)
    return getTweetLink(selectedFile)
}

const constructTweetLink = (sound: Sound): TweetLink => {
    return `https://twitter.com/${functions.config().twitter.account_name}/status/${sound.tweetId}`
}
