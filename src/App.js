import React from 'react'
import {Route, Router, Switch} from 'react-router-dom'
import {createBrowserHistory} from 'history'
import SlackSuccess from './pages/SlackSuccess'
import Root from './pages/Root'
import Page404 from './pages/Page404'
import './App.css'
import Player from './pages/Player'

export const history = createBrowserHistory()

const App = () => {
    return (
        <Router history={history}>
            <Switch>
                <Route exact path="/" component={Root}/>
                <Route path="/slack/success/" component={SlackSuccess}/>
                <Route path="/:fileName.mp3" component={Player}/>
                <Route component={Page404} status={404}/>
            </Switch>
        </Router>
    )
}

export default App
