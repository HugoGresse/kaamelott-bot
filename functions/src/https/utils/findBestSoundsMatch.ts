import {Sound} from '../../interfaces/Sound'
import {getSoundboardSounds} from '../../common/getSoundboardSounds'

export const findBestSoundsMatch = async (inputText: string): Promise<Sound[]> => {
    const sounds: Sound[] = await getSoundboardSounds()

    return sounds.filter(sound => sound.title.trim().toLowerCase().includes(inputText))
}

export const getFileUrl = (sound: Sound): string => `https://raw.githubusercontent.com/2ec0b4/kaamelott-soundboard/master/sounds/${sound.file}`
export const getFileGUID = (sound: Sound): string => `kaamelott-soundboard/${sound.file}`
