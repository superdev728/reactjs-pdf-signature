import React from 'react'
import fullscreen from './icon/fullscreen.svg'
import plus from './icon/plus.svg'
import minus from './icon/minus.svg'

function Toolbar(props) {
    return (
        <div className="Toolbar">
            <div className="Toolbar-item" onClick={()=>props.setScale(1.0)}><img src={fullscreen} width="20" alt="fullscreen" /></div>
            <div className="Toolbar-item" onClick={()=>props.setScale(props.scale + 0.2)}><img src={plus} width="20" alt="plus" /></div>
            <div className="Toolbar-item" onClick={()=>props.setScale(props.scale - 0.2)}><img src={minus} width="20" alt="minus" /></div>
        </div>
    )
}

export default Toolbar