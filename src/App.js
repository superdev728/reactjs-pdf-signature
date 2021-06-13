import React, {useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { Document, Page, pdfjs } from 'react-pdf/dist/umd/entry.webpack'
import { useDropzone } from 'react-dropzone'
import SignaturePad from 'react-signature-canvas'
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

import './App.css';
import "./sigCanvas.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

const imageUrls = [];

function App() {
  
  const [page, setPage] = useState(1)
  const [totalPage, setTotalPage] = useState(null)
  const [errorMsg, setErrorMsg] = useState("")
  const [pdfByte, setPdfByte] = useState(null)
  const [scale, setScale] = useState(1.0)
  const [padModalOpen, setPadModalOpen] = useState(true)
  const [imageURLs, setImageURLs] = useState(null)
  const [fileName, setFileName] = useState('sample')
  const [imgPos, setImgPos] = useState(null)
  const [dateState, setDateState] = useState(false)
  const [pageNavigateState, setPageNavigateState] = useState(false)
  const sigCanvas = useRef({});
  const pageRefs = useMemo(() => Array.from({length: totalPage}).map(()=>React.createRef()), [totalPage])

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles && acceptedFiles.length && acceptedFiles[0]) {
      setFileName(acceptedFiles[0].name)
      acceptedFiles[0].arrayBuffer().then(x => setPdfByte({data: x}))
    }
  }, [])
  const {getRootProps, getInputProps} = useDropzone({onDrop})

  function onDocumentLoadSuccess(pdf) {
    setTotalPage(pdf.numPages)
    // setPage(1)
  }

  function onPageLoad() {
    console.log("onPageLoad");
  }

  function loadError(error) {
    setErrorMsg(error.message)
  }

  function onPassword(callback) {
    const password = prompt("Password")
    callback(password)
  }

  const delay = ms => new Promise(res => setTimeout(res, ms));	

  async function Download() {
    let pdf;
    for(var i = 1; i <= totalPage; i++) {
      setPage(i);
      setPageNavigateState(true);
      await delay(2000);

      const PDFElement = document.getElementsByClassName('react-pdf__Document')[0];

      await html2canvas(PDFElement, {
        height: PDFElement.offsetHeight,
        scrollY: -window.scrollY,
        scrollX: -window.scrollX,
        windowHeight:
        PDFElement.offsetHeight,
      }).then((canvas) => {
          const imgData = canvas.toDataURL("image/png");
          if(i === 1) {
            pdf = new jsPDF("", "pt", [canvas.width, canvas.height]);
            pdf.addImage(
              imgData,
              "png",
              0,
              0,
              canvas.width,
              canvas.height,
              ("a" + i),
              "FAST"
            );
          } else {
            pdf.addPage("", "pt", [canvas.width, canvas.height])
            pdf.addImage(
              imgData,
              "png",
              0,
              0,
              canvas.width,
              canvas.height,
              ("a" + i),
              "FAST"
            );
          }
      })
    }
    
    pdf.save(`${fileName}.pdf`);
  }

  function OpenSignaturePad() {
    setPadModalOpen(!padModalOpen);
    document.getElementsByTagName('body')[0].style.overflow='hidden';
  }

  function GoPage(state) {
    setPageNavigateState(true)
    if(state === 'next') {
      if(page < totalPage) {
        setPage(page + 1);
      }
    } else if(state === 'pre') {
      if(page-1 > 0) {
        setPage(page-1);
      }
    }
  }

  function SaveSignature() {
    const imgUrl = sigCanvas.current.getTrimmedCanvas().toDataURL("image/png");
    var date = new Date();
    var signedDate = `${date.getFullYear()}/${(date.getMonth()+1) < 10 ? '0' + (date.getMonth()+1) : date.getMonth()+1}/${date.getDate()}`;
    const signData = {};
    signData[page] = {
      ImgURL: imgUrl,
      imagePosition: imgPos ? imgPos : null,
      signedDate
    }
    imageUrls.push(signData);
    setImageURLs(imageUrls);
    document.getElementsByTagName('body')[0].style.overflow='inherit';
    setPadModalOpen(!padModalOpen);
  }
  
  function CloseModal() {
    document.getElementsByTagName('body')[0].style.overflow='inherit';
    setPadModalOpen(!padModalOpen)
  }

  function AddDate() {
    setDateState(!dateState);
  }

  function Drag(props) {
    let dragStartLeft = null;
    let dragStartTop = null;
    let dragStartX = null;
    let dragStartY = null;
    let handleRef = null;
    let imgPosition = '';

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
      imgPosition = `translate(${ dragStartLeft + clientX - dragStartX}px, ${dragStartTop + clientY - dragStartY}px)`;
      handleRef.style.transform = imgPosition;
    }
  
    const stopDragging = () => {
      setImgPos(imgPosition);
      setPageNavigateState(false)

      window.removeEventListener('mousemove', startDragging, false);
      window.removeEventListener('mouseup', stopDragging, false);
    }
    
    return <>
      <img
        onMouseDown={initialiseDrag} 
        ref={setHandleRef}
        src={props.item[page]['ImgURL']}
        alt="my signature"
        style={{
          display: 'block',
          width: '10%',
          height: '10%',
          position: 'absolute',
          zIndex: '2',
          transform: `${pageNavigateState ? props.item[page]['imagePosition'] : imgPos}`,
        }}
      />
      <span
        className={dateState ? 'signed-date' : 'd-none'}
        style={{
          transform: `${pageNavigateState ? props.item[page]['imagePosition'] : imgPos}`,
        }}>{props.item[page]['signedDate']}</span>
    </>
  }

  useEffect(() => {
    let ImgURLs = [];
    imageURLs && imageURLs.map((item) => {
      Object.keys(item).map((key) => {
        if(parseInt(page, 10) === parseInt(key, 10)) {
          item[page]['imagePosition'] = imgPos;
        }
        ImgURLs.push(item);
       })
     })
     // eslint-disable-next-line
  }, [imgPos])

  return (
    <div className="App">
      { pdfByte ?
          <>
            <div className="show-page">
              <p>{page} of {totalPage}</p>
            </div>
            <div className="Editor">
                <div className="Editor-item" onClick={ OpenSignaturePad }>Signature Document</div>
                <div className="Editor-item" onClick={ AddDate }>{!dateState ? "Add Date" : "Delete Date"}</div>
                <div className="Editor-item" onClick={ Download }>Download</div>
                <br />
                <div className="Editor-item" onClick={ () => GoPage('next') }>Next Page</div>
                <div className="Editor-item" onClick={ () => GoPage('pre') }>Previous Page</div>
            </div>
          </>
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
      <div>
        { pdfByte ?
          <div>
            <Document onLoadSuccess={onDocumentLoadSuccess} onLoadError={loadError} onPassword={onPassword} file={pdfByte}>
              <Page ref={pageRefs[1]} scale={scale || 1} pageNumber={Number(page)} onLoadSuccess={onPageLoad} />
              {imageURLs ? <>
                {
                  imageURLs.map((item) => {
                   return Object.keys(item).map((key) => {
                     return parseInt(key, 10) === parseInt(page, 10) ?  <Drag key={key} item={item}></Drag> : null
                    })
                  })
                }
              </>
                : null
              }
            </Document>
          </div> 
          : 
          <div {...getRootProps()} className="Dropzone">
            <input {...getInputProps()} />
            {
              <p>Upload Document to Sign</p>
            }
          </div>
        }
        {/* <MyDocument></MyDocument>
        <input type="url" className="file-input" onKeyPress={(e) => UploadFile(e)} placeholder="Please write the document url here." /> <button className="file-upload" onClick={(e) => UploadFile(e)}>Upload</button> */}
      </div>
    </div>
  )
}

export default App
