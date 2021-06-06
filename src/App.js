import React, {useEffect, useState, useCallback, useMemo, useRef } from 'react'
// import { PDFDocument } from 'pdf-lib'
import { Document, Page, pdfjs } from 'react-pdf'
import { useDropzone } from 'react-dropzone'
import Header from './Header'
import Toolbar from './Toolbar'
import Signature from './Signature'
import { useScrollPosition } from './hook/useScroll'
import SignaturePad from 'react-signature-canvas';

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

  function SaveSignature() {

  }

  useEffect(() => {
    console.log("init")
  }, [])

  let AllPages = []
  for (var i=1; i<=totalPage; i++) {
    AllPages.push(<Page key={i} ref={pageRefs[i-1]} scale={scale || 1} pageNumber={i} onLoadSuccess={onPageLoad} />)
  }

  !padModalOpen ?
    document.getElementsByTagName('body')[0].style.overflow='hidden'
  :
    document.getElementsByTagName('body')[0].style.overflow='inital'
  return (
    <div className="App">
      <Header filename={fileName} totalPage={totalPage} currentPage={page} />
      <Toolbar setScale={setScale} scale={scale} />
      { pdfByte ?
          <div className="Editor">
              <div className="Editor-item" onClick={ () => setPadModalOpen(!padModalOpen) }>{ padModalOpen ? "SignatureDocument" : "Cancel"}</div>
              <div className="Editor-item" onClick={ Download }>Download</div>
          </div>
          :
          <></>

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
                    <button className="Editor-item">Save</button>
                    <button className="Editor-item" onClick={() => {sigCanvas.current.clear()}}>Clear</button>
                    <button className="Editor-item" onClick={() => {setPadModalOpen(!padModalOpen)}}>Cancel</button>
                  </div>
                </div>
              :
              <></>
            }
        </div> :
        <></>
      }
      { pdfByte ?
        <div>
          <Document onLoadSuccess={loadSuccess} onLoadError={loadError} onPassword={onPassword} file={pdfByte}>
            {AllPages}
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
