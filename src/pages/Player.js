import React, {useEffect} from 'react'
import {useLocation, useParams} from 'react-router'
import './Player.css'

const Player = () => {
    const {fileName} = useParams()
    const location = useLocation()

    const urlParams = new URLSearchParams(location.search)

    const name = decodeURI(urlParams.get('n'))
    const personnage = decodeURI(urlParams.get('p'))
    const episode = decodeURI(urlParams.get('e'))

    const mediaRef = React.createRef()
    const inputRef = React.createRef()

    const path = `${process.env.REACT_APP_STORAGE_PATH}sounds/${fileName}.mp3`

    const play = () => {
        const media = mediaRef.current

        if (!media) {
            return
        }

        if (media.paused) {
            inputRef.current.checked = true
            media.play()
        } else {
            inputRef.current.checked = false
            media.pause()
        }
    }

    useEffect(() => {
        const media = mediaRef.current
        if (!media || !inputRef) {
            return
        }

        inputRef.current.checked = false


        const stopMedia = () => {
            if (inputRef.current) {
                inputRef.current.checked = false
            }
        }

        media.addEventListener('ended', stopMedia)

        return () => {
            media.removeEventListener('ended', stopMedia)
        }
    }, [mediaRef, inputRef])

    return <div className="container">

        <div className="text">
            <b>{personnage}</b>
            {name}
            <i>{episode}</i>
        </div>

        <div className="playpause" onClick={play}>
            <input
                type="checkbox"
                id="playpause"
                name="check"
                ref={inputRef}
                onClick={play}/>
            <label htmlFor="playpause"/>
        </div>

        <audio ref={mediaRef}>
            <source src={path} type="audio/mpeg"/>
            Your browser does not support the <code>audio</code> element.
        </audio>


    </div>

}

export default Player
