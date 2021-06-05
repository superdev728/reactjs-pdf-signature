import React, {useEffect, useState, useCallback, useMemo } from 'react'
// import { PDFDocument } from 'pdf-lib'
import { Document, Page, pdfjs } from 'react-pdf'
import { useDropzone } from 'react-dropzone'
import Header from './Header'
import Toolbar from './Toolbar'
import Editor from './Editor'
import { useScrollPosition } from './hook/useScroll'

import './App.css'

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

function App() {
  
  const [page, setPage] = useState(null)
  const [totalPage, setTotalPage] = useState(null)
  const [errorMsg, setErrorMsg] = useState("")
  const [pdfByte, setPdfByte] = useState(null)
  const [fileName, setFileName] = useState(null)
  const [scale, setScale] = useState(1.0)
  const pageRefs = useMemo(() => Array.from({length: totalPage}).map(()=>React.createRef()), [totalPage])

  useScrollPosition(({currPos}) => {
    const y = -currPos.y + (window.innerHeight / 10)
    console.log(y)
    for (let i=0; i<totalPage; i++) {
      if (!pageRefs[i] || !pageRefs[i].current || !pageRefs[i].current.ref) break;
      console.log(y, i, pageRefs[i].current.ref.offsetTop + pageRefs[i].current.ref.offsetHeight)
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
    console.log(page)
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
      <Editor />
      { pdfByte ?
      <Document onLoadSuccess={loadSuccess} onLoadError={loadError} onPassword={onPassword} file={pdfByte}>
        {AllPages}
      </Document> :
      <div {...getRootProps()} className="Dropzone">
        <input {...getInputProps()} />
        {
          isDragActive ? 
          <p>Drop the files here ...</p> :
          <p>Drag 'n' drop some files here, or click to select files</p>
        }
      </div>
      }
    </div>
  )
}

export default App
