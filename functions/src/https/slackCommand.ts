import * as functions from 'firebase-functions'
import {db} from './utils/initFirebase'
import * as crypto from 'crypto'
import * as qs from 'qs'

export const slackCommand = functions.https.onRequest(async (request, response) => {
    if (request.method !== "POST") {
        console.error(`Got unsupported ${request.method} request. Expected POST.`)
        return response.status(405).send("Only POST requests are accepted")
    }

    const {slack} = functions.config()

    if (!slack || !slack.signing_secret) {
        console.error("Missing slack credentials (signing_secret)")
        return response.status(501).send("Missing slack credentials")
    }

    console.log(request.body.user_name)

    if (!doesSlackSignatureMatch(request, slack.signing_secret)) {
        return response.status(401).send("Invalid message signature")
    }

    return response.status(200).send("C'est pas faux")
})

const doesSlackSignatureMatch = (request: functions.https.Request, signingSecret: string): boolean => {
    const requestSlackSignature = request.header('x-slack-signature')
    const requestSlackTimestamp = request.header('x-slack-request-timestamp')
    const requestBody = qs.stringify(request.body, {format: 'RFC1738'})

    if (!requestSlackTimestamp || !requestSlackSignature || !requestBody) {
        console.warn("Missing data on the request")
        return false
    }

    if (Math.abs(Date.now() / 1000 - parseInt(requestSlackTimestamp)) > 60 * 5) {
        // Maybe a request attack, ignore
        console.warn('Request attack suspected')
        return false
    }

    const verifyString = `v0:${requestSlackTimestamp}:${requestBody}`
    const digest = 'v0=' + crypto.createHmac('sha256', signingSecret)
        .update(verifyString)
        .digest('hex')

    return crypto.timingSafeEqual(
        Buffer.from(digest, 'utf8'),
        Buffer.from(requestSlackSignature, 'utf8'))
}

export const getWebhookUrl = async (teamId: string) => {
    const docSnapshot = await db.collection("installations").doc(teamId).get()

    if (docSnapshot.exists) {
        // @ts-ignore
        return docSnapshot.data().webhook.url
    }
}
