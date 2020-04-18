import * as functions from 'firebase-functions'
import {verifySlackPostRequest} from './utils/verifySlackPostRequest'

export const slackEvent = functions.https.onRequest(async (request, response) => {
    // Slack Event challenge to verify server
    if (request.body.challenge) {
        return response.send(request.body.challenge)
    }

    const token = await verifySlackPostRequest(request, response)
    if (!token) {
        return
    }

    return response.send()

})
