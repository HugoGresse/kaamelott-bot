import * as functions from 'firebase-functions'
import {verifySlackPostRequest} from './utils/verifySlackPostRequest'
import fetch from 'node-fetch'

const TYPE_BLOCK_ACTIONS = "block_actions"

export const slackInteractivity = functions.https.onRequest(async (request, response) => {
    const [] = await verifySlackPostRequest(request, response)

    const payload = (JSON.parse(request.body.payload))
    const type = payload.type
    const channelId = payload.channel.id
    const responseUrl = payload.response_url

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

    response
        .status(200)
        .send()

    await fetch(responseUrl, {
        method: "POST",
        body: JSON.stringify({
            delete_original: true
        })
    })

    return
})

