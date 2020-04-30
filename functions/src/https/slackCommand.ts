import * as functions from 'firebase-functions'
import {verifySlackPostRequest} from './utils/verifySlackPostRequest'
import {findBestSoundsMatch} from './utils/findBestSoundsMatch'
import {Sound} from '../interfaces/Sound'
import fetch from 'node-fetch'

export const slackCommand = functions.https.onRequest(async (request, response) => {
    if (!await verifySlackPostRequest(request, response)) {
        return response.status(418).send("I'm a teapot ☕️")
    }

    response.send()

    console.log(`${request.body.team_domain} ${request.body.user_name}`)

    const inputText = request.body.text.trim().toLowerCase()
    const potentialSounds = (await findBestSoundsMatch(inputText)).slice(0, 5)
    const responseUrl = request.body.response_url

    return fetch(responseUrl, {
        method: "POST",
        body: JSON.stringify(getSlackPreviewBlock(potentialSounds))
    })
})

export const getSlackPreviewBlock = (soundsMeta: Sound[]) => {
    if (soundsMeta.length === 0) {
        return {
            blocks: [{
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `Aucune réplique trouvé correspondant à votre demande`
                },
            }]
        }
    }

    const blocks = soundsMeta.map(soundMeta => ({
        type: "section",
        text: {
            type: "mrkdwn",
            text: `*${soundMeta.character}*: "${soundMeta.title}"\n_Épisode:${soundMeta.episode}_`
        },
        accessory: {
            type: "button",
            text: {
                type: "plain_text",
                text: "Envoyer",
                emoji: true
            },
            value: soundMeta.file
        }
    }))

    return {
        blocks: blocks
    }
}
