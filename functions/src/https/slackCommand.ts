import * as functions from 'firebase-functions'
import {verifySlackPostRequest} from './utils/verifySlackPostRequest'

export const slackCommand = functions.https.onRequest(async (request, response) => {
    const [] = await verifySlackPostRequest(request, response)

    console.log(request.body.user_name)

    return response.contentType("json").status(200).send(JSON.stringify({
        ...getSlackPreviewBlock({
            character: "toto",
            episode: "episode 2",
            title: "Le gras c'est la vie"
        })
    }))
})

export const getSlackPreviewBlock = (soundMeta: {
    character: string,
    episode: string,
    title: string
}) => {
    return {
        blocks: [
            {
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
                    value: "click_me_123"
                }
            }
        ]
    }


}
