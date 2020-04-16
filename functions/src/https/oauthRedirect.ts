import * as functions from 'firebase-functions'
import fetch from 'node-fetch'
import {URLSearchParams} from 'url'
import {db, serverTimestamp} from './utils/initFirebase'

export const oauthRedirect = functions.https.onRequest(async (request, response) => {
    const {slack} = functions.config()

    if (!slack || !slack.client_id || !slack.client_secret) {
        console.error("Missing slack credentials (client_id or client_secret)")
        return response.status(501).send("Missing slack credentials")
    }

    if (request.method !== "GET") {
        console.error('Got unsupported ${request.method} request. Expected GET.')
        return response.status(405).send("Only GET requests are accepted")
    }

    // @ts-ignore
    if (!request.query && !request.query.code) {
        return response.status(401).send("Missing query attribute 'code'")
    }

    const params = new URLSearchParams()
    params.append('code', `${request.query.code}`)
    params.append('client_id', `${slack.client_id}`)
    params.append('client_secret', `${slack.client_secret}`)
    params.append('redirect_uri', `https://us-central1-${process.env.GCLOUD_PROJECT}.cloudfunctions.net/oauthRedirect`)

    const result = await fetch("https://slack.com/api/oauth.v2.access", {
        method: "POST",
        body: params
    })

    if (!result.ok) {
        console.error("The request was not ok: " + JSON.stringify(result))
        return response.header("Location", `https://${process.env.GCLOUD_PROJECT}.firebaseapp.com`).send(302)
    }

    const slackResultData = await result.json()
    await saveNewInstallation(slackResultData)

    return response.header("Location", `https://${process.env.GCLOUD_PROJECT}.firebaseapp.com/slack/success`).send(302)
})

export const saveNewInstallation = async (slackResultData: {
    team: {
        id: string,
        name: string
    },
    access_token: string,
    incoming_webhook: {
        url: string,
        channel_id: string
    }
}) => {
    return await db.collection("installations")
        .doc(slackResultData.team.id).set({
            token: slackResultData.access_token,
            teamId: slackResultData.team.id,
            teamName: slackResultData.team.name,
            createdAt: serverTimestamp()
        })
}
