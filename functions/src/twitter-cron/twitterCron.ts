import {getSoundboardSounds} from '../common/getSoundboardSounds'
import {Sound} from '../interfaces/Sound'
import * as functions from 'firebase-functions'


export const twitterCron = async () => {
    const missingQuotes = await getMissingQuotes()

    console.log(missingQuotes)
    await uploadMissingQuotes(missingQuotes)
}

export const twitterCronCallable = functions.https.onRequest(async (request, response) => {
    await twitterCron()
    response.send()
})


const getMissingQuotes = async (): Promise<Sound[]> => {
    const firestoreQuotes = await getSoundboardSounds()
    const firestoreSoundAsMap = firestoreQuotes.reduce((acc: { [key: string]: Sound }, item) => {
        acc[item.file] = item
        return acc
    }, {} as { string: Sound })
    const kaamelottSoundboardQuotes = await getSoundboardSounds()

    return kaamelottSoundboardQuotes.filter(sound => firestoreSoundAsMap[sound.file])
}

const uploadMissingQuotes = async (quotes: Sound[]) => {
    // TODO
}
