import {getFileUrl, Sound} from '../interfaces/Sound'
import * as FFMpegCommand from 'fluent-ffmpeg'
import fetch from 'node-fetch'

const fileName = 'video.mp4'

export type fileName = string
export const convertMP3toMP4 = async (sound: Sound): Promise<fileName> => {
    return new Promise(((resolve, reject) => {
        fetch(getFileUrl(sound))
            .then(async (res) => {
                if (res.ok && res.body) {
                    return convertToMP4(res.body)
                }
                reject("Failed to get mp3")
            })
            .then(() => {
                resolve(fileName)
            })
    }))
}

// ffmpeg -loop 1 -i image.jpg -i audio.mp3 -c:a copy -c:v libx264 -shortest out.mp4
const convertToMP4 = (input: NodeJS.ReadableStream) => {
    return new Promise(((resolve, reject) => {
        console.log("convert")
        // @ts-ignore
        const command = new FFMpegCommand(input)
        command.loop(1)
            .addInput('./miniature.png')
            .audioCodec('copy')
            .videoCodec('libx264')
            .outputOptions('-shortest')
            .format('mp4')
            .on('error', (error: Error) => {
                console.log("error", error)
                reject(error)
            })
            .on('end', () => {
                console.log("convert end")
                resolve(fileName)
            })
            .output(fileName)
    }))
}


