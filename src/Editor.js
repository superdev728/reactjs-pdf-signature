import React, {useState} from 'react';

function Editor(props) {
    const [mode, setMode] = useState(null)
    if (mode === 'text' || mode === 'draw') {
        document.body.style.cursor = 'crosshair'
    } else {
        document.body.style.cursor = 'default'
    }
    return (
        <div className="Editor">
            { mode ?
            <div className="Editor-item" onClick={() => setMode(null)}>Cancel</div>
            :
            <>
            <div className="Editor-item" onClick={() => setMode('signature')}>Signature</div>
            <div className="Editor-item" onClick={() => setMode('draw')}>Draw</div>
            <div className="Editor-item" onClick={() => setMode('Image')}>Image</div>
            <div className="Editor-item" onClick={() => setMode('text')}>Text</div>
            </>
            }
        </div>
    )
}

export default Editor