import {Sound} from '../interfaces/Sound'
import {db, serverTimestamp} from './initFirebase'

export const getSounds = async (): Promise<Sound[]> => {
    const soundSnapshots = await db
        .collection('sounds')
        .get()

    return soundSnapshots.docs.map(sound => {
        return sound.data() as Sound
    })
}

export const addSound = async (tweetId: string, sound: Sound) => {
    await db
        .collection('sounds')
        .doc(sound.file)
        .set({
            ...sound,
            createdAt: serverTimestamp(),
            tweetId
        })
}
