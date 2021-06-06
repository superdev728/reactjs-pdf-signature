import React, {useState} from 'react';
import SignaturePad from 'react-signature-canvas';

function Signature(props) {
    return <div className='signature-pad'>
            <SignaturePad
            backgroundColor='white'
            penColor='balck'
              canvasProps={{
                className: "signatureCanvas"
              }}
            />
    </div>
}

export default Signature