import React from "react";
import './AppContainer.css'


const AppContainer = ({children}) => {
    return(
        <div className="app-shell-wrapper">
            <div className="app-shell-content">
                {children}
            </div>
        </div>
    );
};

export default AppContainer;