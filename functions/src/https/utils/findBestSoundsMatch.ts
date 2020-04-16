import fetch from 'node-fetch'

export interface Sound {
    title: string,
    file: string,
    episode: string,
    character: string
}

export const findBestSoundsMatch = async (inputText: string): Promise<Sound[]> => {
    const soundsResponse = await fetch('https://raw.githubusercontent.com/2ec0b4/kaamelott-soundboard/master/sounds/sounds.json')
    const sounds: Sound[] = await soundsResponse.json()

    return sounds.filter(sound => sound.title.trim().toLowerCase().includes(inputText))
}
