import EditorPane from "./EditorPane";
import ProblemPane from "./ProblemPane";
import OutputPane from "./OutputPane";
import InputPane from "./InputPane";
import GeminiPane from "./GeminiPane";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { urlContext } from "../urlContext";

export default function ProblemPage() {
  const { url } = useContext(urlContext);
  const options = [
    { value: "C++", label: "C++", id: 54 },
    { value: "javascript", label: "javascript", id: 63 },
    { value: "Java", label: "Java", id: 62 },
  ];
  let [jsCode, setJsCode] = useState(
    "//your code goes here\nconsole.log('Hello World')"
  );
  let [javaCode, setJavaCode] = useState(
    "class Main{\n\tpublic static void main(String[] args){\n\t\t//your code goes here\n\n\t}\n}"
  );
  let [cppCode, setCppCode] = useState(
    "#include<bits/stdc++.h>\nusing namespace std;\n\nint main(){\n\t//your code goes here\n\n\treturn 0;\n}"
  );
  let [langOption, setLangOption] = useState(options[0]);
  let [processing, setProcessing] = useState(false);
  let [geminiCall, setGeminiCall] = useState(false);
  let [output, setOutput] = useState("");
  const [input, setInput] = useState("");
  const [runOrSubmit, setRunOrSubmit] = useState("");
  const [geminiPane, setGeminiPane] = useState(false);
  const [typeOfHelp, setTypeOfHelp] = useState("");
  const { id } = useParams();
  const [problem, setProblem] = useState({});
  const [geminiResponse, setGeminiResponse] = useState("");
  useEffect(() => {
    if (id) {
      axios
        .get(`${url}problems/${id}`)
        .then((res) => {
          setProblem(res.data);
          setInput(res.data.input);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [id]);

  const handleLangChange = (langOption) => {
    setLangOption(langOption);
  };
  const handleCodeChange = (value) => {
    langOption.value === "javascript" && setJsCode(value);
    langOption.value === "Java" && setJavaCode(value);
    langOption.value === "C++" && setCppCode(value);
  };
  const handleRun = () => {
    if (processing === false) {
      setProcessing(true);
      setRunOrSubmit("run");
      axios
        .post(`${url}run`, {
          lang: langOption.id,
          code:
            langOption.value === "javascript"
              ? jsCode
              : langOption.value === "Java"
              ? javaCode
              : cppCode,
          customInput: input,
        })
        .then((res) => {
          setProcessing(false);
          setOutput(JSON.stringify(res.data));
        })
        .catch((err) => {
          console.log(err);
          setProcessing(false);
          setOutput("Error");
        });
    }
  };
  const handleSubmit = () => {
    if (processing === false) {
      setProcessing(true);
      setRunOrSubmit("submit");
      axios
        .post(`${url}submit`, {
          lang: langOption.id,
          code:
            langOption.value === "javascript"
              ? jsCode
              : langOption.value === "Java"
              ? javaCode
              : cppCode,
          problemId: problem.problemId,
        })
        .then((res) => {
          setProcessing(false);
          setOutput(JSON.stringify(res.data));
        })
        .catch((err) => {
          console.log(err);
          setProcessing(false);
          setOutput("Error");
        });
    }
  };
  const geminiHelp = () => {
    setGeminiCall(true);
    let code =
      langOption.value === "javascript"
        ? jsCode
        : langOption.value === "Java"
        ? javaCode
        : cppCode;
    axios
      .post(url + "genai", {      
        code: code,
        typeOfHelp: typeOfHelp,
        problemId: problem.problemId,
      })
      .then((res) => {
        setGeminiCall(false);
        setGeminiResponse(geminiResponse +"\n\nchat \n\n\n" +res.data);
      });
  };

  return (
    <>
    <div className="root-div">
      <div className="header-div">
        <div className="buttons-header">
          <button onClick={handleRun} className="run-btn">
            Run
          </button>
          <button onClick={handleSubmit} className="submit-btn">
            Submit
          </button>
        </div>
        <button
          onClick={() => setGeminiPane(!geminiPane)}
          className="gemini-btn"
        >
          Get help with Gemini
        </button>
      </div>
      <div className="content">
        <PanelGroup autoSaveId="example" direction="horizontal">
          <Panel defaultSize={45} minSize={20}>
            <ProblemPane problem={problem} />
          </Panel>
          <PanelResizeHandle className="resize-handle" />
          <Panel minSize={20} defaultSize={55}>
            <PanelGroup autoSaveId="example" direction="vertical">
              <Panel defaultSize={50} className="editor-pane">
                <EditorPane
                  langOption={langOption}
                  options={options}
                  jsCode={jsCode}
                  javaCode={javaCode}
                  cppCode={cppCode}
                  handleLangChange={handleLangChange}
                  handleCodeChange={handleCodeChange}
                />
              </Panel>
              <PanelResizeHandle className="resize-handlev" />
              <Panel minSize={7} defaultSize={35} maxSize={90}>
                <div className="stats-pane">
                  <h2>Testcases</h2>
                  <PanelGroup autoSaveId="example" direction="horizontal">
                    <Panel defaultSize={50} className="input-pane">
                      <InputPane input={input} setInput={setInput} />
                    </Panel>
                    <hr />
                    <Panel defaultSize={50} className="output-pane">
                      <OutputPane
                        runOrSubmit={runOrSubmit}
                        processing={processing}
                        output={output}
                      />
                    </Panel>
                  </PanelGroup>
                </div>
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
        ;
      </div>

      <GeminiPane
        geminiCall={geminiCall}
        pane={geminiPane}
        geminiResponse={geminiResponse}
        geminiHelp={geminiHelp}
        typeOfHelp={typeOfHelp}
        setTypeOfHelp={setTypeOfHelp}
        runOrSubmit={runOrSubmit}
      />
    </div>
    <div className="phonescreen">
      <h1>This website is designed only for tab or higher display sizes</h1>
    </div>
    </>
  );
}
