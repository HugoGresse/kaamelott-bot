import React from 'react'

const Root = () => {

    return <div style={{
        background: "#EEE",
        textAlign: "center",
        display: "flex",

        minHeight: 'calc(100vh - 60px)',
        margin: 10,
        padding: 20,
        flexDirection: 'column',
    }}>

        To install the bot, use the button bellow
        <br/>
        <br/>
        <a href="https://slack.com/oauth/v2/authorize?client_id=89232678994.1064034348338&scope=commands">
            <img
                alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png"
                srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x"/>
        </a>

        <a href="https://github.com/HugoGresse/kaamelott-bot"
           style={{
               marginTop: 20
           }}>More info on Github</a>

    </div>

}

export default Root
