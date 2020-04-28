import React from 'react'

const SlackSuccess = () => {

    return <div style={{
        background: "#EEE",
        textAlign: "center",
        minHeight: '100vh',
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center"
    }}>

        <h3>
            Slack app successfully installed
        </h3>
        <br/>
        <p style={{fontSize: 100, marginTop: 0}}>
            <span role="img" aria-label="img">🎉</span>
        </p>
    </div>
}

export default SlackSuccess
