import React, { useState, useRef, useEffect } from "react";
import { decode as base64_decode, encode as base64_encode } from "base-64";
import Client from "../Components/Client";
import Editor from "../Components/Editor";
import toast from "react-hot-toast";
import axios from "axios";
import ACTIONS from "../Actions";
import loading2 from "../load.gif";
import Select from "react-select";

import {
  useLocation,
  useNavigate,
  Navigate,
  useParams,
} from "react-router-dom";
import { initSocket } from "../socket";
const loading1 = loading2;
export const EditorPage = () => {
  const [selectedLanguage, setSelectedLanguage] = useState({
    label: "C++",
    value: "54",
  });
  const [isHovering, setIsHovering] = useState(false);
  const [sampleInput, setSampleInput] = useState("");
  const [sampleOutput, setSampleOutput] = useState("");
  const [clients, setClients] = useState([]);
  const socketRef = useRef(null);
  const location = useLocation();
  const reactNavigator = useNavigate();
  const { roomId } = useParams();
  const codeRef = useRef(null);
  const [loading5, setloading5] = useState(false);

  const languageOptions = [
    { label: "C++", value: "54" },
    { label: "JavaScript", value: "63" },
    { label: "Python", value: "71" },
  ];

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on("connect_error", (err) => handleErrors(err));
      socketRef.current.on("connect_failed", (err) => handleErrors(err));
      function handleErrors(e) {
        console.log("socket error", e);
        toast.error("Socket connection failed, try again later.");
        reactNavigator("/");
      }
      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state?.username,
      });
      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, username, socketId }) => {
          if (username !== location.state?.username) {
            toast.success(`${username} joined the room.`);
          }
          setClients(clients);
          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current,
            socketId,
          });
        }
      );
      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left the room.`);
        setClients((prev) => {
          return prev.filter((client) => client.socketId !== socketId);
        });
      });
    };
    init();
    // return () => {
    //   socketRef.current.disconnect();
    //   socketRef.current.off(ACTIONS.JOINED);
    //   socketRef.current.off(ACTIONS.DISCONNECTED);
    // };
  }, []);
  async function copyRoomId() {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("Room ID Copied to Your Clipboard");
    } catch (err) {
      toast.error("Could not copy the Room ID");
      console.error(err);
    }
  }

  function leaveRoom() {
    reactNavigator("/");
  }
  if (!location.state) {
    return <Navigate to="/" />;
  }

  const submitCode = () => {
    setloading5(true);
    const base64_encoded_code = base64_encode(codeRef.current);
    const base64_encoded_input = base64_encode(sampleInput);
    // 54 for c++
    // for python
    // for java

    const options = {
      method: "POST",
      url: "https://judge0-ce.p.rapidapi.com/submissions",
      params: { base64_encoded: "true", wait: true, fields: "*" },
      headers: {
        "content-type": "application/json",
        "Content-Type": "application/json",
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        "X-RapidAPI-Key": "f2f34b5fedmsh24f6250d41bb281p1fe116jsn0d726f8b0608",
      },
      data: {
        language_id: `${selectedLanguage.value}`,
        source_code: base64_encoded_code,
        stdin: base64_encoded_input,
      },
      // data: {
      //   "source_code": "#include <stdio.h>\n\nint main(void) {\n  char name[10];\n  scanf(\"%s\", name);\n  printf(\"hello, %s\n\", name);\n  return 0;\n}",
      //   "language_id": 4,
      //   "stdin": "world"
      // }
    };
    console.log(base64_encoded_code);
    axios
      .request(options)
      .then(function (response) {
        const base64_decoded_output = base64_decode(response.data.stdout);
        setSampleOutput(base64_decoded_output);
        setloading5(false);
      })
      .catch(function (error) {
        console.error(error);
      });
  };
  const colourStyles = {
    control: (styles, { data, isDisabled, isFocused, isSelected }) => ({
      ...styles,
      color: "#f9d3b4",
      backgroundColor: "#212426",
      boxShadow:
        "-6px -6.5px 13px rgba(255, 255, 255, 0.132),6px 7px 15px rgba(0, 0, 0, 0.33)",
      border: isSelected ? "4.3px solid #2a2a2a" : "4.3px solid #2a2a2a",
      borderRadius: "100px",
    }),
    option: (styles, { data, isDisabled, isFocused, isSelected }) => {
      return {
        ...styles,
        color: "black",
        zIndex: "9",
      };
    },
    singleValue: (provided, state) => ({
      ...provided,
      color: "#f9d3b4de",
      fontSize: state.selectProps.myFontSize,
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  };
  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };
  return (
    <div className="mainWrap">
      <div className="aside">
        <div className="asideInner">
          <div className="logo">
            <h2 className="editor-title">&lt;CodePair/&gt;</h2>
          </div>
          <h3 className="connected">Connected Users</h3>
          <div className="clientsList">
            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </div>
        </div>
        <button className="btn copyBtn" onClick={copyRoomId}>
          Copy Room ID
        </button>
        <button className="btn leaveBtn" onClick={leaveRoom}>
          Leave
        </button>
      </div>
      <div className="editorWrap">
        <div className="editor-section">
          <Editor
            socketRef={socketRef}
            roomId={roomId}
            onCodeChange={(code) => {
              codeRef.current = code;
            }}
          />
        </div>
        <div classsName="submit">
          <h2 classsName="output-title">Output</h2>
          <div className="output">
            {loading5 ? (
              <img className="loading" src={loading1} />
            ) : (
              sampleOutput
            )}
          </div>
          <input
            className="sampleInput"
            placeholder="Enter Input"
            onChange={(e) => setSampleInput(e.target.value)}
          />
          <div className="languageAndRun">
            {console.log(selectedLanguage)}
            <Select
              className="select"
              options={languageOptions}
              onChange={(language) => setSelectedLanguage(language)}
              styles={colourStyles}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              menuPortalTarget={document.body}
            />
            <button className="btn submitBtn" onClick={() => submitCode()}>
              Run Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;
