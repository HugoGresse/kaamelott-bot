import * as functions from 'firebase-functions'

export const slackCommand = functions.https.onRequest(async (request, response) => {
    return response.status(200).send("C'est pas faux")
})
