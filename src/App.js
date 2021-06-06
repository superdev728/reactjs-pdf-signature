import React, {useEffect, useState, useCallback, useMemo, useRef } from 'react'
// import { PDFDocument } from 'pdf-lib'
import { Document, Page, pdfjs } from 'react-pdf'
import { useDropzone } from 'react-dropzone'
import Header from './Header'
import Toolbar from './Toolbar'
import { useScrollPosition } from './hook/useScroll'
import SignaturePad from 'react-signature-canvas'

import './App.css';
import "./sigCanvas.css";


pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

function App() {
  
  const [page, setPage] = useState(null)
  const [totalPage, setTotalPage] = useState(null)
  const [errorMsg, setErrorMsg] = useState("")
  const [pdfByte, setPdfByte] = useState(null)
  const [fileName, setFileName] = useState(null)
  const [scale, setScale] = useState(1.0)
  const [padModalOpen, setPadModalOpen] = useState(true)
  const pageRefs = useMemo(() => Array.from({length: totalPage}).map(()=>React.createRef()), [totalPage])
  const [imageURL, setImageURL] = useState(null);

  const sigCanvas = useRef({});

  useScrollPosition(({currPos}) => {
    const y = -currPos.y + (window.innerHeight / 10)
    for (let i=0; i<totalPage; i++) {
      if (!pageRefs[i] || !pageRefs[i].current || !pageRefs[i].current.ref) break;
      if (y < pageRefs[i].current.ref.offsetTop + pageRefs[i].current.ref.offsetHeight) {
        setPage(i+1)
        break;
      }
    }
  })
  
  // async function openPdf(file) {
  //   const pdfDoc = await PDFDocument.load(await file.arrayBuffer())
  //   const page = pdfDoc.addPage([350, 400])
  //   page.moveTo(110, 200)
  //   page.drawText('Hello World!')
  //   //iframeEl.current.src = await pdfDoc.saveAsBase64({ dataUri: true })
  //   setPdfByte({data: await pdfDoc.save()})
  // }
  
  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles && acceptedFiles.length && acceptedFiles[0]) {
      setFileName(acceptedFiles[0].name)
      acceptedFiles[0].arrayBuffer().then(x => setPdfByte({data: x}))
    }
  }, [])
  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})

  function loadSuccess(pdf) {
    setTotalPage(pdf.numPages)
    setPage(1)
  }

  function loadError(error) {
    setErrorMsg(error.message)
  }

  function onPassword(callback) {
    const password = prompt("Password")
    callback(password)
  }

  function onPageLoad(page) {
    // console.log(page)
  }

  function Download() {

  }

  function OpenSignaturePad() {
    setPadModalOpen(!padModalOpen);
    document.getElementsByTagName('body')[0].style.overflow='hidden';
  }

  function SaveSignature() {
    setImageURL(sigCanvas.current.getTrimmedCanvas().toDataURL("image/png"));
    document.getElementsByTagName('body')[0].style.overflow='inherit';
    setPadModalOpen(!padModalOpen)
  }
  
  function CloseModal() {
    console.log(padModalOpen, document.getElementsByTagName('body')[0].style.overflow, "close modal");
    document.getElementsByTagName('body')[0].style.overflow='inherit';
    setPadModalOpen(!padModalOpen)
  }

  function Drag(props) {
    let dragStartLeft = null;
    let dragStartTop = null;
    let dragStartX = null;
    let dragStartY = null;
    let handleRef = null;

    const setHandleRef = (ref) => {
      handleRef = ref;
    }
      
    const initialiseDrag = (event) => {
      const {target, clientX, clientY} = event;
      const { offsetTop, offsetLeft } = target;
      const { left, top } = handleRef.getBoundingClientRect();
      dragStartLeft = left - offsetLeft;
      dragStartTop = top - offsetTop;
      dragStartX = clientX;
      dragStartY = clientY;
      window.addEventListener('mousemove', startDragging, false);
      window.addEventListener('mouseup', stopDragging, false);
    }
    
    const startDragging = ({ clientX, clientY }) => {    
      handleRef.style.transform = `translate(${ dragStartLeft + clientX - dragStartX}px, ${dragStartTop + clientY - dragStartY}px)`;
    }
  
    const stopDragging = () => {
      window.removeEventListener('mousemove', startDragging, false);
      window.removeEventListener('mouseup', stopDragging, false);
    }  
    
    return <img
       onMouseDown={initialiseDrag} 
       ref={setHandleRef}
        src={props.imgSrc}
        alt="my signature"
        style={{
          display: 'block',
          width: '10%',
          position: 'absolute',
          marginTop: '30vh'
        }}
      />
  }

  useEffect(() => {
    console.log("init")
  }, [])

  let AllPages = []
  for (var i=1; i<=totalPage; i++) {
    AllPages.push(<Page key={i} ref={pageRefs[i-1]} scale={scale || 1} pageNumber={i} onLoadSuccess={onPageLoad} />)
  }
  return (
    <div className="App">
      <Header filename={fileName} totalPage={totalPage} currentPage={page} />
      <Toolbar setScale={setScale} scale={scale} />
      { pdfByte ?
          <div className="Editor">
              <div className="Editor-item" onClick={ OpenSignaturePad }>SignatureDocument</div>
              <div className="Editor-item" onClick={ Download }>Download</div>
          </div>
          : null

      }
      { pdfByte ?
        <div className={!padModalOpen ? "signature-modal" : ""}>
            {
              !padModalOpen ?
                <div className="signature-modal-body">
                  <SignaturePad
                  ref={sigCanvas}
                    canvasProps={{
                      className: "signatureCanvas"
                    }}
                  />
                  <div className="signature-buttons">
                    <button className="Editor-item" onClick={ SaveSignature }>Save</button>
                    <button className="Editor-item" onClick={ () => {sigCanvas.current.clear()} }>Clear</button>
                    <button className="Editor-item" onClick={ CloseModal} >Cancel</button>
                  </div>
                </div>
              :
              null
            }
        </div> : null
      }
      { pdfByte ?
        <div>
          <Document onLoadSuccess={loadSuccess} onLoadError={loadError} onPassword={onPassword} file={pdfByte}>
            {AllPages}
            {imageURL ? (
              <Drag imgSrc={imageURL}></Drag>
              ) : null
            }
          </Document>
        </div> :
      <div {...getRootProps()} className="Dropzone">
        <input {...getInputProps()} />
        {
          isDragActive ? 
          <p>Upload Document to Sign</p> :
          <p>Upload Document to Sign</p>
        }
      </div>
      }
    </div>
  )
}

export default App
