import {Sound} from '../interfaces/Sound'
import * as admin from 'firebase-admin'

export const getSoundboardSounds = async (): Promise<Sound[]> => {
    const soundSnapshots = await admin
        .firestore()
        .collection('sounds')
        .get()

    return soundSnapshots.docs.map(sound => {
        return sound.data() as Sound
    })
}
