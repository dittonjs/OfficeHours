import React from 'react';
import ReactDOM from 'react-dom';

const App = () => {
    return (
        <div>
            <img id="usu-logo" src="/vertical_logo_blue.png" />
            <h1>Welcome to the LTI Starter App</h1>
        </div>
    );
}

ReactDOM.render(<App />, document.getElementById("app"));