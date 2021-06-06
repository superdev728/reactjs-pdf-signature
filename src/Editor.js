import React, {useState} from 'react';

function Editor(props) {
    const [mode, setMode] = useState(null);
    return (
        <div className="Editor">
            { mode ?
            <div className="Editor-item" onClick={() => setMode(null)}>Cancel</div>
            :
            <>
            <div className="Editor-item" onClick={() => setMode('download')}>Download</div>
            </>
            }
        </div>
    )
}

export default Editor