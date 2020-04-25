import fetch from 'node-fetch'
import {Sound} from '../interfaces/Sound'

export const getSoundboardSounds = async (): Promise<Sound[]> => {
    const soundsResponse = await fetch('https://raw.githubusercontent.com/2ec0b4/kaamelott-soundboard/master/sounds/sounds.json')
    return await soundsResponse.json()
}
