import {Sound} from '../../interfaces/Sound'
import {getSoundboardSounds} from '../../common/getSoundboardSounds'

export const findBestSoundsMatch = async (inputText: string): Promise<Sound[]> => {
    const sounds: Sound[] = await getSoundboardSounds()

    return sounds.filter(sound => sound.title.trim().toLowerCase().includes(inputText))
}
