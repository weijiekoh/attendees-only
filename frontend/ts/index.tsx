import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import Web3Provider from 'web3-react'

import Nav from './nav'
import AboutRoute from './routes/about'
import MainRoute from './routes/main'
import connectors from './web3'

import {
    initStorage,
} from './storage'

const App = () => {
    initStorage()
    return (
        <Web3Provider connectors={connectors} libraryName='ethers.js'>
            <div className='section'>

                <Nav />

                <div className='section'>
                    <div className='container'>
                        <Router>
                            <Route path='/' exact component={MainRoute} />
                            <Route path='/about' exact component={AboutRoute} />
                        </Router>
                    </div>
                </div>
            </div>
        </Web3Provider>
    )
}

const root = document.getElementById('root')

ReactDOM.render(<App />, root)
