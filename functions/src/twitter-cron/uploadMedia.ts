import {Sound} from '../interfaces/Sound'
import {twitterClient} from './twitter'
import {convertMP3toMP4} from './convertMP3toMP4'
import * as fs from 'fs'
import {removeFile} from '../utils/removeFile'
import {sleep} from '../utils/sleep'

export type MediaId = string

export const uploadMedia = async (sound: Sound): Promise<MediaId> => {
    const mediaType = "video/mp4"

    try {
        const fileName = await convertMP3toMP4(sound)
        const mediaData = fs.readFileSync(fileName)
        const mediaSize = fs.statSync(fileName).size

        return initUpload(mediaType, mediaSize)
            .then(appendUpload(mediaData)) // Send the data for the media
            .then(finalizeUpload) // Declare that you are done uploading chunks
            .then(async mediaId => {
                await removeFile(fileName)
                return mediaId
            })
    } catch (error) {
        throw error
    }
}

/**
 * Step 1 of 3: Initialize a media upload
 * @return Promise resolving to String mediaId
 */
const initUpload = (mediaType: string, mediaSize: number) => {
    return makePost('media/upload', {
        command: 'INIT',
        total_bytes: mediaSize,
        media_type: mediaType,
        media_category: 'tweet_video'
    }).then((data: any) => data.media_id_string)
}

/**
 * Step 2 of 3: Append file chunk
 */
const appendUpload = (mediaData: Buffer) => (mediaId: string) => {
    return makePost('media/upload', {
        command: 'APPEND',
        media_id: mediaId,
        media: mediaData,
        segment_index: 0
    }).then(() => mediaId)
}

/**
 * Step 3 of 3: Finalize upload
 */
function finalizeUpload(mediaId: string) {
    return makePost('media/upload', {
        command: 'FINALIZE',
        media_id: mediaId
    }).then(async (data) => {
        const dataInput = data as any
        if (dataInput.processing_info && dataInput.processing_info.state === 'pending') {
            const waitDurationMs = dataInput.processing_info.check_after_secs * 1500
            console.log(`Waiting ${waitDurationMs} for the video to being processed`)
            await sleep(waitDurationMs)
        }
        return mediaId
    })
}

/**
 * (Utility function) Send a POST request to the Twitter API
 */
function makePost(endpoint: string, params: {}) {
    return new Promise((resolve, reject) => {
        if (!twitterClient) {
            reject()
            return
        }
        twitterClient.post(endpoint, params, (error, data, response) => {
            if (error) {
                reject(error)
            } else {
                resolve(data)
            }
        })
    })
}
