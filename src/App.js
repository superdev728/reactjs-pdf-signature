import React, {useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
// import { Document, Page, PDFViewer  } from '@react-pdf/renderer'
import { useDropzone } from 'react-dropzone'
import SignaturePad from 'react-signature-canvas'
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

import './App.css';
import "./sigCanvas.css";
import { pdf } from '@react-pdf/renderer';


pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

const imageUrls = [];

function App() {
  
  const [page, setPage] = useState(1)
  const [totalPage, setTotalPage] = useState(null)
  const [errorMsg, setErrorMsg] = useState("")
  const [pdfByte, setPdfByte] = useState(null)
  // const [fileName, setFileName] = useState(null)
  const [scale, setScale] = useState(1.0)
  const [padModalOpen, setPadModalOpen] = useState(true)
  const pageRefs = useMemo(() => Array.from({length: totalPage}).map(()=>React.createRef()), [totalPage])
  const [imageURLs, setImageURLs] = useState(null);
  const [imgPos, setImgPos] = useState(null)
  const sigCanvas = useRef({});

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles && acceptedFiles.length && acceptedFiles[0]) {
      // setFileName(acceptedFiles[0].name)
      acceptedFiles[0].arrayBuffer().then(x => setPdfByte({data: x}))
    }
  }, [])
  const {getRootProps, getInputProps} = useDropzone({onDrop})

  function onPageLoad(page) {
    // console.log(page)
  };

  async function Download() {
    const PDFElement = document.getElementsByClassName('react-pdf__Document')[0];
    await html2canvas(PDFElement, {
      height: PDFElement.offsetHeight,
      scrollY: -window.scrollY,
      scrollX: -window.scrollX,
      windowHeight:
      PDFElement.offsetHeight,
    }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("", "pt", [canvas.width, canvas.height]);
        pdf.addImage(
          imgData,
          "png",
          0,
          0,
          canvas.width,
          canvas.height,
          ("a"),
          "FAST"
        );
        console.log(pdf);
        // pdf.save("sample.pdf");
    })
  }

  function OpenSignaturePad() {
    setPadModalOpen(!padModalOpen);
    document.getElementsByTagName('body')[0].style.overflow='hidden';
  }

  function GoPage(state) {
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
    const signData = {};
    signData[page] = {
      ImgURL: imgUrl,
      imagePosition: imgPos,
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
      setImgPos(imgPosition)
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
          height: '10%',
          position: 'absolute',
          transform: `${imgPos}`,
          // marginTop: '30vh'
        }}
      />
  }

  function MyDocument() {
    function loadSuccess(pdf) {
      setTotalPage(pdf.numPages)
      // setPage(1)
    }
  
    function loadError(error) {
      setErrorMsg(error.message)
    }
  
    function onPassword(callback) {
      const password = prompt("Password")
      callback(password)
    }

    return <Document onLoadSuccess={loadSuccess} onLoadError={loadError} onPassword={onPassword} file={pdfByte}>
              <Page ref={pageRefs[1]} scale={scale || 1} pageNumber={page} onLoadSuccess={onPageLoad} />
              {imageURLs ? <>
                {
                  imageURLs.map((item) => {
                  return Object.keys(item).map((key) => {
                    return key == page ?  <Drag key={key} imgSrc={item[page]['ImgURL']}></Drag> : null
                    })
                  })
                }
              </>
                : null
              }
            </Document>
  }

  function fileupload(e) {
    console.log(e.target.files[0]);
  }

  useEffect(() => {
    console.log("init")
  }, [])

  return (
    <div className="App">
      { pdfByte ?
          <>
            <div className="show-page">
              <p>{page} of {totalPage}</p>
            </div>
            <div className="Editor">
                <div className="Editor-item" onClick={ OpenSignaturePad }>SignatureDocument</div>
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
            {/* <PDFDownloadLink document={<MyDocument />} filename="sample.pdf">Download</PDFDownloadLink> */}
            <MyDocument></MyDocument>
            {/* <Document onLoadSuccess={loadSuccess} onLoadError={loadError} onPassword={onPassword} file={pdfByte}>
              <Page ref={pageRefs[1]} scale={scale || 1} pageNumber={Number(page)} onLoadSuccess={onPageLoad} />
              {imageURLs ? <>
                {
                  imageURLs.map((item) => {
                   return Object.keys(item).map((key) => {
                     return key == page ?  <Drag key={key} imgSrc={item[page]['ImgURL']}></Drag> : null
                    })
                  })
                }
              </>
                : null
              }
            </Document> */}
          </div> : 
        <div {...getRootProps()} className="Dropzone">
          <input {...getInputProps()} />
          {
            <p>Upload Document to Sign</p>
          }
        </div>

        }
      </div>
    </div>
  )
}

export default App
