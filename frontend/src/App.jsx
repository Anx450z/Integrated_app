import { useState, useEffect } from 'react';
import { Document, Page } from 'react-pdf';
import { pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json';
import { googlecode } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import './App.css';
import filesIcon from './assets/emblem-documents-symbolic.svg';
import rightIcon from './assets/arrow4-right-symbolic.svg';
import paperIcon from './assets/paper-symbolic.svg';
import folderIcon from './assets/search-folder-symbolic.svg';
import copyIcon from './assets/copy.svg';
import brainIcon from './assets/brain-augemnted-symbolic.svg';
import decodeIcon from './assets/decode-symbolic.svg';
import parseIcon from './assets/center-on-page-horizontal-symbolic.svg';
import tickIcon from './assets/success-small-symbolic.svg';
import Card from './Components/Card/Card.jsx';
import cardIcon from './assets/credit-card-symbolic.svg';
import codeIcon from './assets/code-symbolic.svg';
import selectIcon from './assets/radio-checked-symbolic.svg';
import crossIcon from './assets/radio-symbolic.svg';
import createFuzzySearch from '@nozbe/microfuzz';

pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

SyntaxHighlighter.registerLanguage('json', json);

function App() {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [pdfFile, setPdfFile] = useState(null);
  const [jsonData, setJsonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState('pdf_to_json');
  const [llmModel, setLlmModel] = useState('openai');
  const [status, setStatus] = useState('');
  const [historyStatus, setHistoryStatus] = useState(true);
  const [fileHistory, setFileHistory] = useState([]);
  const [parsedFiles, setParsedFiles] = useState([]);
  const [jsonHashList, setJsonHashList] = useState(new Map([]));
  const [viewJson, setViewJson] = useState(false);
  const [blockedPagesHash, setBlockedPagesHash] = useState(new Map([]));
  const [thumbnails, setThumbnails] = useState([]);
  const [fuzzyResults, setFuzzyResults] = useState([]);
  const apiUrl = 'http://localhost:5000';

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  function changePage(offset) {
    setPageNumber((prevPageNumber) => prevPageNumber + offset);
  }

  function previousPage() {
    changePage(-1);
  }

  function nextPage() {
    changePage(1);
  }

  function changeScale(newScale) {
    setScale(newScale);
  }

  function handleFileChange(event) {
    const file = event.target.files[0];
    setPdfFile(file);
    setFileHistory([file, ...fileHistory]);
    setJsonData(null);
  }

  useEffect(() => {
    console.log('Connecting to SSE...');
    const eventSource = new EventSource(`${apiUrl}/stream`);

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      eventSource.close();
    };

    eventSource.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        setStatus(data.message);
      } catch (error) {
        console.error('Error parsing event data:', error);
      }
    });

    return () => {
      eventSource.close();
    };
  }, []);

  useEffect(() => {
    if (pdfFile) {
      const loadThumbnails = async () => {
        const pages = [];
        for (let i = 1; i <= numPages; i++) {
          pages.push(i);
        }
        setThumbnails(pages);
      };
      loadThumbnails();
    }
  }, [pdfFile, numPages]);

  function handleThumbnailClick(pageNumber) {
    setPageNumber(pageNumber);
  }

  async function parseToJson() {
    if (!pdfFile) return;
    setJsonData(null);
    const domain = 'http://localhost:5000/parse_json';
  
    const formData = new FormData();
    formData.append('file', pdfFile);
    formData.append('parse_method', method);
    formData.append('llm_model', llmModel);
    formData.append('blocked_pages', blockedPagesHash.get(pdfFile.name) || '');
  
    setLoading(true);
    try {
      const response = await fetch(domain, {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
  
      setLoading(false);
      setJsonData(JSON.stringify(data, null, 2));
      setParsedFiles([...parsedFiles, pdfFile.name]);
      jsonHashList.set(pdfFile.name, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error parsing PDF:', error);
      setJsonData(JSON.stringify({ error: 'Failed to parse PDF' }, null, 2));
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(JSON.stringify(JSON.parse(jsonData)['parsed_json']));
    const copied = document.getElementById('copied');
    copied.classList.remove('copied');
    copied.style.display = 'flex';
    setTimeout(() => {
      copied.classList.add('copied');
    }, 10);
  }

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    setPdfFile(selectedFiles[0]);
    setFileHistory((prevHistory) => [...prevHistory, ...selectedFiles]);
  };

  function renderJsonData(file) {
    setPdfFile(file);
    setFuzzyResults([]);
    document.getElementById('search-input').value = '';
    parsedFiles.includes(file.name) ? setJsonData(jsonHashList.get(file.name)) : setJsonData(null);
  }

  function handleBlockedPages(file, pageNumber) {
    setBlockedPagesHash((prev) => {
      const newMap = new Map(prev);
      if (newMap.has(file.name)) {
        const pages = newMap.get(file.name);
        if (pages.includes(pageNumber)) {
          newMap.set(
            file.name,
            pages.filter((page) => page !== pageNumber)
          );
        } else {
          newMap.set(file.name, [...pages, pageNumber]);
        }
      } else {
        newMap.set(file.name, [pageNumber]);
      }
      return newMap;
    });
  }

  const fuzzySearch = createFuzzySearch(fileHistory, {
    // search by `name` property
    key: 'name',
    getText: (item) => [item.name]
  })

  return (
    <div className="app">
      <div className="content">
        {historyStatus ? (
          <p className="reveal-history" title="open files panel" onClick={() => setHistoryStatus(!historyStatus)}>
            <img src={rightIcon} alt="" />
          </p>
        ) : (
          <div className="history-pane">
            <div className="selection-container">
              <div className="heading">
                <img src={filesIcon} alt="" />
                <p>Files</p>
                <input type="text" id="search-input" placeholder="search" onChange={(e) => setFuzzyResults(fuzzySearch(e.target.value))}/>
              </div>
              <p className="hide-history" title="close files panel" onClick={() => setHistoryStatus(!historyStatus)}>
                <img src={rightIcon} alt="" style={{ transform: 'rotate(180deg)' }} />
              </p>
            </div>
            {fuzzyResults.length > 0 ? <ul className="fuzzy-results">
              {fuzzyResults.map((result, index) => (
                <li key={index} className="file-list" onClick={() => renderJsonData(result.item)}><div className='file-name'>{result.item.name}</div></li>
              ))}
            </ul> : null}
            <ul className="file-list-container">
              {Object.entries(fileHistory).map(([key, file]) => (
                <li
                  key={key}
                  title={file.name}
                  className={pdfFile.name == file.name ? 'file-list file-list-selected' : 'file-list'}
                  onClick={() => renderJsonData(file)}
                >
                  <div className="file-name">
                    {parsedFiles.includes(file.name) ? (
                      <div className="overlap-icons">
                        <img src={paperIcon} alt="" />
                        <img src={tickIcon} alt="" />
                      </div>
                    ) : (
                      <img src={paperIcon} alt="" />
                    )}
                    {file.name}
                  </div>
                  <p className="file-size">{Math.round(file.size / 1000, 1)} KB</p>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="pdf-pane">
          {loading ? <div className="loading-container"></div> : null}
          <div className="selection-container">
            <div className="linear">
              <input
                type="file"
                multiple
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                id="files-input"
                accept="application/pdf"
              />
              <button title="select files" onClick={() => document.getElementById('files-input').click()}>
                <img src={folderIcon} alt="" />
              </button>
              <div className='file-selector'>
                <input style={{display: 'none'}} type="file" id="file-input" onChange={handleFileChange} accept="application/pdf" />
                <p title="select a file" className='file-name'  onClick={() => document.getElementById('file-input').click()}>{pdfFile ? pdfFile.name : 'select file'}</p>
              </div>
            </div>
            <div className="dropdown-container">
              <div className="linear">
                <img src={parseIcon} alt="" />
                <p>Method</p>
              </div>
              <select className="dropdown" value={method} onChange={(e) => setMethod(e.target.value)}>
                <option value="pdf_to_json">PDF to JSON</option>
                <option value="text_to_json">Text to JSON</option>
                <option value="image_to_json">Image to JSON</option>
              </select>
            </div>
          </div>
          {pdfFile && (
            <>
              <ul className="thumbnail-strip">
                {thumbnails.map((page) => (
                  <li
                    key={page}
                    title={`page ${page}`}
                    className={page == pageNumber ? 'thumbnail current-page' : 'thumbnail'}
                    onClick={() => handleThumbnailClick(page)}
                  >
                    <Document file={pdfFile}>
                      <Page pageNumber={page} scale={0.2} />
                    </Document>
                    <div className="thumbnail-overlay" onClick={() => handleBlockedPages(pdfFile, page)}>
                      <img
                        src={
                          blockedPagesHash.has(pdfFile.name) && blockedPagesHash.get(pdfFile.name).includes(page)
                            ? crossIcon
                            : selectIcon
                        }
                        alt=""
                      />
                    </div>
                  </li>
                ))}
              </ul>
              <Document file={pdfFile} onLoadSuccess={onDocumentLoadSuccess}>
                <Page pageNumber={pageNumber} scale={scale} />
              </Document>
              <div className="pdf-controls">
                <div className="page-controls">
                  <button className="circular-button" onClick={previousPage} disabled={pageNumber <= 1}>
                    <img
                      src={rightIcon}
                      alt=""
                      style={{
                        transform: 'rotate(180deg)',
                      }}
                    />
                  </button>
                  <button className="circular-button" onClick={nextPage} disabled={pageNumber >= numPages}>
                    <img src={rightIcon} alt="" />
                  </button>
                </div>
                <div className="zoom-level" title='reset zoom' onClick={() => changeScale(1)}>
                  {Math.round(scale * 100)}%
                </div>
                <div className="zoom-controls">
                  <button className="zoom-button" onClick={() => changeScale(scale + 0.1)}>
                    +
                  </button>
                  <button className="zoom-button" onClick={() => changeScale(scale - 0.1)}>
                    -
                  </button>
                </div>
                <div className="page-number">
                  {pageNumber || (numPages ? 1 : '--')} / {numPages || '--'}
                </div>
              </div>
            </>
          )}
        </div>
        <div className="json-pane">
          <div className={loading ? '' : 'fade-in'}></div>
          {loading ? (
            <div className="status">
              <p>{status}</p>
            </div>
          ) : null}
          <div className="selection-container">
            <div className="dropdown-container">
              <div className="linear">
                <img src={brainIcon} alt="" />
                <p className="llm-model">LLM</p>
              </div>
              <select className="dropdown" value={llmModel} onChange={(e) => setLlmModel(e.target.value)}>
                <option value="openai">Open AI</option>
                <option value="gemini">Gemini</option>
                <option value="ollama">Ollama</option>
                <option value="anthropic" disabled>
                  Anthropic
                </option>
              </select>
            </div>
            <div className="linear">
              <p style={{ display: 'none' }} id="copied">
                copied!
              </p>
              <div>
                {jsonData && (
                  <button title="copy to clipboard" onClick={copyToClipboard}>
                    <img src={copyIcon} alt="" />
                  </button>
                )}
              </div>
              {jsonData && (
                <button title={viewJson ? 'show code' : 'show cards'} onClick={() => setViewJson(!viewJson)}>
                  {viewJson ? <img src={codeIcon} alt="show code" /> : <img src={cardIcon} alt="show cards" />}
                </button>
              )}
              {pdfFile && (
                <button onClick={parseToJson}>
                  <div className="linear">
                    <img src={decodeIcon} alt="decode" />
                    Parse
                  </div>
                </button>
              )}
            </div>
          </div>
          <div className="json-controls"></div>
          {viewJson ? (
            <div className="card-container">
              {jsonData && JSON.parse(jsonData).parsed_json.map((item, index) => <Card key={index} data={item} />)}
            </div>
          ) : (
            <SyntaxHighlighter language="json" style={googlecode} showLineNumbers wrapLongLines>
              {jsonData}
            </SyntaxHighlighter>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
