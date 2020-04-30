import {getSoundboardSounds} from '../common/getSoundboardSounds'
import {Sound} from '../interfaces/Sound'
import * as functions from 'firebase-functions'
import {addSound, getSounds} from '../common/soundCollections'
import {initTwitter, twitterClient} from './twitter'
import {uploadMedia} from './uploadMedia'
import {limitCharCount} from '../utils/string'

// export const twitterCron = functions.pubsub.schedule('every 3 minutes').onRun(async () => {
//     await twitterCronTask()
//     return null
// })

export const twitterCronCallable = functions.https.onRequest(async (request, response) => {
    try {
        await twitterCronTask()
        response.send({
            success: true
        })
    } catch (error) {
        response.status(500).send({
            msg: "error",
            error
        })
    }
})

export const twitterCronTask = async () => {
    initTwitter(functions.config().twitter)
    const missingQuotes = await getMissingQuotes()
    console.log(missingQuotes.length, "missing quotes")

    if (missingQuotes.length > 0) {
        await uploadSound(missingQuotes[0])
    }
}

export const twitterUpload = functions.https.onRequest(async (request, response) => {
    response.set('Access-Control-Allow-Origin', '*')
    if (!functions.config().common || !functions.config().common.new_sound_key) {
        return response.status(418).send('Nop ❌')
    }

    const key = functions.config().common.new_sound_key
    const payload = JSON.parse(request.body)
    const submittedKey = payload.key
    const fileNameToUpload = payload.filename
    if (key !== submittedKey) {
        return response.status(401).send('Nop ❌')
    }

    try {
        initTwitter(functions.config().twitter)

        const kaamelottSoundboardQuotes = await getSoundboardSounds()
        const sounds = kaamelottSoundboardQuotes.filter(sound => sound.file === fileNameToUpload)

        if (sounds.length > 0) {
            const soundToAdd = sounds[0]
            console.log(`Trying to add ${soundToAdd.file} because it was missing`)
            await uploadSound(soundToAdd)
            return response.send(JSON.stringify({
                success: true
            }))
        } else {
            return response.status(500).send({
                msg: "error",
                error: "No sound matched the requested one"
            })
        }
    } catch (error) {
        response.status(500).send({
            msg: "error",
            error
        })
    }
    return response.status(500).send({
        msg: "error",
        error: "nothing to do"
    })
})

const getMissingQuotes = async (): Promise<Sound[]> => {
    const firestoreQuotes = await getSounds()
    const firestoreSoundAsMap = firestoreQuotes.reduce((acc: { [key: string]: Sound }, item) => {
        acc[item.file] = item
        return acc
    }, {} as { string: Sound })
    const kaamelottSoundboardQuotes = await getSoundboardSounds()

    return kaamelottSoundboardQuotes.filter(sound => !firestoreSoundAsMap[sound.file])
}

const uploadSound = async (sound: Sound) => {
    console.log("Adding " + sound.file)
    const tweetId = await addQuoteToTwitter(sound)
    if (tweetId) {
        await saveQuote(tweetId, sound)
    } else {
        throw new functions.https.HttpsError(
            'internal',
            'No tweet id to post the sound'
        )
    }
}

const saveQuote = async (tweetId: string, quote: Sound) => {
    await addSound(tweetId, quote)
    console.log(`>Added ${quote.title}!`)
}

const addQuoteToTwitter = async (quote: Sound): Promise<string> => {
    return uploadMedia(quote)
        .then(mediaId => {
            if (!twitterClient) {
                throw new functions.https.HttpsError(
                    'failed-precondition',
                    'Missing Twitter credentials'
                )
            }

            return twitterClient
                .post('statuses/update', {
                    status: limitCharCount(`${limitCharCount(quote.title, 180)}\r\n${quote.character} (${quote.episode})`, 275),
                    media_ids: mediaId
                })
                .then(tweet => tweet.id_str)
        }).catch(error => {
            throw new functions.https.HttpsError(
                'internal',
                'Failed to upload file or convert it, ' + JSON.stringify(error)
            )
        })
}
