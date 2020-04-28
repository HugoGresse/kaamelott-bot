import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import "normalize.css"

const render = AppComponent => {
    return ReactDOM.render(
        <AppComponent/>,
        document.getElementById('root')
    )
}

render(App)

if (module.hot) {
    module.hot.accept('./App', () => {
        const NextApp = require('./App').default
        render(NextApp)
    })
}
