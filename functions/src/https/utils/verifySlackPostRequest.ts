import * as functions from 'firebase-functions'
import {doesSlackSignatureMatch} from './doesSlackSignatureMatch'
import * as express from 'express'
import {getAppToken} from './getAppToken'

/**
 * Verify that a slack request is valid by checking it's integrity and that it was correctly installed.
 * If the request is not valid, it will answer an http error directly and return false
 * It verified successfully, the token to use (bot_token)
 */
export const verifySlackPostRequest = async (request: functions.https.Request, response: express.Response): Promise<false | string> => {
    if (request.method !== "POST") {
        console.error(`Got unsupported ${request.method} request. Expected POST.`)
        await response.status(405).send("Only POST requests are accepted")
        return false
    }

    const {slack} = functions.config()

    if (!slack || !slack.signing_secret) {
        console.error("Missing slack credentials (signing_secret)")
        await response.status(501).send("Missing slack credentials")
        return false
    }

    if (!doesSlackSignatureMatch(request, slack.signing_secret)) {
        await response.status(401).send("Invalid message signature")
        return false
    }

    const appToken = await getAppToken(request.body.team_id || JSON.parse(request.body.payload).team.id)
    if (!appToken) {
        await response.send('Application not configured for your workplace')
        return false
    }

    return appToken
}
