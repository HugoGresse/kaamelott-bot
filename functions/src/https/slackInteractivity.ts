import * as functions from 'firebase-functions'
import {verifySlackPostRequest} from './utils/verifySlackPostRequest'
import fetch from 'node-fetch'
import {getSound} from '../common/soundCollections'
import {Sound} from '../interfaces/Sound'

const TYPE_BLOCK_ACTIONS = "block_actions"

export const slackInteractivity = functions.https.onRequest(async (request, response) => {
    response
        .status(200)
        .send("✅  Ça arrive !")

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
        return callResponseUrl('Type not implemented', responseUrl, 501)
    }
    if (!channelId) {
        console.log("No channel id")
        return callResponseUrl('Missing channel id', responseUrl, 400)
    }
    if (!responseUrl) {
        console.log("No response_url")
        return callResponseUrl('Missing response_url', responseUrl, 400)
    }
    if (!selectedFile) {
        console.log("No selected file or action not supported")
        return callResponseUrl('Missing supported action', responseUrl, 400)
    }

    await callResponseUrl("✅  Ça arrive !", responseUrl)

    try {
        const tweetLink = await getTweetLink(selectedFile)

        return fetch(responseUrl, {
            method: "POST",
            body: JSON.stringify({
                delete_original: true,
                replace_original: false,
                response_type: 'in_channel',
                text: `Posté par <@${payload.user.id}> \r\n ${tweetLink}`,
                unfurl_media: true,
                unfurl_link: true,
            })
        })
    } catch (error) {
        return callResponseUrl('Erreur lors de la récupération du son ou de son upload...', responseUrl, 400)
    }
})

type TweetLink = string
const getTweetLink = async (selectedFile: string): Promise<TweetLink> => {
    const sound = await getSound(selectedFile)

    if (sound && sound.tweetId) {
        return constructTweetLink(sound)
    }

    await requestNewSound(selectedFile)
    return getTweetLink(selectedFile)
}

const constructTweetLink = (sound: Sound): TweetLink => {
    return `https://twitter.com/${functions.config().twitter.account_name}/status/${sound.tweetId}`
}

const callResponseUrl = (text: string, url: string, code?: number): Promise<any> => {
    const msg = code ? `Erreur ${code}: ${text}` : text
    return fetch(url, {
        method: "POST",
        body: JSON.stringify({
            text: msg,
        })
    })
}

const requestNewSound = (file: string) => {
    return fetch(functions.config().common.twitter_upload_url, {
        method: "POST",
        body: JSON.stringify({
            key: functions.config().common.new_sound_key,
            filename: file
        })
    }).then(response => {
        if (response.ok) {
            return
        }
        console.error("Failed to request a new sound", response.status, response.statusText)
        throw new Error('Failed to get new sound')
    })
}
