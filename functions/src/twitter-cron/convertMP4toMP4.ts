import * as functions from 'firebase-functions'
import {getFileUrl, Sound} from '../interfaces/Sound'
import * as FFMpegCommand from 'fluent-ffmpeg'
import * as stream from 'stream'
import fetch from 'node-fetch'
import * as fs from 'fs'
import {removeFile} from '../common/removeFile'

const fileName = 'video.mp4'

export type fileName = string
export const convertMP3toMP4 = async (sound: Sound): Promise<fileName> => {
    return new Promise((async (resolve, reject) => {
        let thumbnailFileName: string | null = null
        try {
            const mp3Response = await fetch(getFileUrl(sound))
            thumbnailFileName = await downloadThumbnail(functions.config().video.thumbnail)

            if (mp3Response.ok && mp3Response.body && thumbnailFileName) {
                const createdFileName = await convertToMP4(mp3Response.body as any, thumbnailFileName)
                resolve(createdFileName)
            }
        } catch (error) {
            reject(error)
        } finally {
            if (thumbnailFileName) {
                await removeFile(thumbnailFileName)
            }
        }
    }))
}

// ffmpeg -loop 1 -i image.jpg -i audio.mp3 -c:a copy -c:v libx264 -shortest out.mp4
const convertToMP4 = (input: stream.Readable, thumbnail: string): Promise<string> => {
    return new Promise(((resolve, reject) => {
        const command = FFMpegCommand(input)
        command
            .addInput(thumbnail)
            .audioCodec('aac')
            .addInputOption('-loop 1')
            .videoCodec('libx264')
            .videoFilter('format=yuv420p')
            .outputOptions('-shortest')
            .format('mp4')
            .on('start', () => {
                console.log("Video conversion started")
            })
            .on('error', (error: Error) => {
                console.log("Video conversion error", error)
                reject(error)
            })
            .on('end', () => {
                console.log("Video conversion ended")
                resolve(fileName)
            })
            .output(fileName)
            .run()
    }))
}

const downloadThumbnail = async (thumbURL: string): Promise<string> => {
    const tumbFileName = './thumbnail.jpg'
    const thumbnailResponse = await fetch(thumbURL)
    return new Promise((resolve, reject) => {
        const fileStream = fs.createWriteStream(tumbFileName)
        thumbnailResponse.body.pipe(fileStream)
        thumbnailResponse.body.on("error", (err: Error) => {
            reject(err)
        })
        fileStream.on("finish", function () {
            resolve(tumbFileName)
        })
    })
}

