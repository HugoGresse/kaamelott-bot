import * as functions from 'firebase-functions'
import {verifySlackPostRequest} from './utils/verifySlackPostRequest'
import fetch from 'node-fetch'
import * as FormData from 'form-data'

const TYPE_BLOCK_ACTIONS = "block_actions"

export const slackInteractivity = functions.https.onRequest(async (request, response) => {
    const token = await verifySlackPostRequest(request, response)
    if (!token) {
        return
    }

    const payload = (JSON.parse(request.body.payload))
    const type = payload.type
    const channelId = payload.channel.id
    const responseUrl = payload.response_url
    const selectedFile = payload.actions ? payload.actions[0].value : null

    if (type !== TYPE_BLOCK_ACTIONS) {
        console.log("Received a not implemented type " + type)
        return response.status(501).send('Type not implemented')
    }
    if (!channelId) {
        console.log("No channel id")
        return response.status(400).send('Missing channel id')
    }
    if (!responseUrl) {
        console.log("No response_url")
        return response.status(400).send('Missing response_url')
    }
    if (!selectedFile) {
        console.log("No selected file or action not supported")
        return response.status(400).send('Missing supported action')
    }

    response
        .status(200)
        .send()

    await postFileToSlack(responseUrl, selectedFile, channelId, token)

    return await deletePreviewMessage(responseUrl)
})

const deletePreviewMessage = (responseUrl: string) => {
    return fetch(responseUrl, {
        method: "POST",
        body: JSON.stringify({
            delete_original: true
        })
    })
}

const postFileToSlack = async (responseUrl: string, selectedFile: string, channelId: string, token: string) => {
    const fileFetchResult = await fetch(`https://raw.githubusercontent.com/2ec0b4/kaamelott-soundboard/master/sounds/${selectedFile}`)

    if (!fileFetchResult.ok) {
        console.log("File fetch failed, should add a message")
        return await deletePreviewMessage(responseUrl)
    }
    const buffer = await fileFetchResult.buffer()

    const form = new FormData()
    form.append('token', token)
    form.append('channels', channelId)
    form.append('filename', selectedFile)
    form.append('title', selectedFile)
    form.append('filetype', "mp3")
    form.append('file', buffer, {
        contentType: 'audio/mpeg3',
        filename: selectedFile
    } as FormData.AppendOptions)

    return fetch("https://slack.com/api/files.upload", {
        method: "POST",
        headers: form.getHeaders(),
        body: form
    }).then(async response => {
        if (!response.ok) {
            console.warn(await response.json())
        }
        return response
    })
}
