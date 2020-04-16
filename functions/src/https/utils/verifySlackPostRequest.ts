import * as functions from 'firebase-functions'
import {doesSlackSignatureMatch} from './doesSlackSignatureMatch'
import {getWebhookUrl} from './getWebhookUrl'
import * as express from 'express'

/**
 * Verify that a slack request is valid by checking it's integrity and that it was correctly installed.
 * If the request is not valid, it will answer an http error directly and return [false]
 * It return an array with:
 * index 0: if it's valid or not
 * index 1: the webhook url only if it's valid
 */
export const verifySlackPostRequest = async (request: functions.https.Request, response: express.Response): Promise<[boolean, string?]> => {
    if (request.method !== "POST") {
        console.error(`Got unsupported ${request.method} request. Expected POST.`)
        await response.status(405).send("Only POST requests are accepted")
        return [false]
    }

    const {slack} = functions.config()

    if (!slack || !slack.signing_secret) {
        console.error("Missing slack credentials (signing_secret)")
        await response.status(501).send("Missing slack credentials")
        return [false]
    }

    if (!doesSlackSignatureMatch(request, slack.signing_secret)) {
        await response.status(401).send("Invalid message signature")
        return [false]
    }

    const webhookUrl = await getWebhookUrl(request.body.team_id || JSON.parse(request.body.payload).team.id)
    if (!webhookUrl) {
        await response.send('Application not configured for your workplace')
        return [false]
    }

    return [true, webhookUrl]
}
