import * as functions from 'firebase-functions'
import * as qs from 'qs'
import * as crypto from "crypto"

export const doesSlackSignatureMatch = (request: functions.https.Request, signingSecret: string): boolean => {
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
