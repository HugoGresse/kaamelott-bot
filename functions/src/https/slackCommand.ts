import * as functions from 'firebase-functions'
import {verifySlackPostRequest} from './utils/verifySlackPostRequest'
import {findBestSoundsMatch, Sound} from './utils/findBestSoundsMatch'

export const slackCommand = functions.https.onRequest(async (request, response) => {
    if (!await verifySlackPostRequest(request, response)) {
        return
    }

    console.log(request.body.user_name)

    const inputText = request.body.text.trim().toLowerCase()

    const potentialSounds = (await findBestSoundsMatch(inputText)).slice(0, 3)

    return response
        .contentType("json")
        .status(200)
        .send(JSON.stringify({
            ...getSlackPreviewBlock(potentialSounds)
        }))
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
