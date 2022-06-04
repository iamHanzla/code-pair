import React, { useState, useRef, useEffect } from "react";
import {decode as base64_decode, encode as base64_encode} from "base-64";
import Client from "../Components/Client";
import Editor from "../Components/Editor";
import toast from "react-hot-toast";
import axios from "axios";
import ACTIONS from "../Actions";
import {
  useLocation,
  useNavigate,
  Navigate,
  useParams,
} from "react-router-dom";
import { initSocket } from "../socket";

export const EditorPage = () => {
  const [sampleInput, setSampleInput] = useState("");
  const [sampleOutput, setSampleOutput] = useState("");
  const [clients, setClients] = useState([]);
  const socketRef = useRef(null);
  const location = useLocation();
  const reactNavigator = useNavigate();
  const { roomId } = useParams();
  const codeRef = useRef(null);

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

  if (!location.state) {
    return <Navigate to="/" />;
  }

  const submitCode = () => {
    const base64_encoded_code = base64_encode(codeRef.current);
    const base64_encoded_input = base64_encode(sampleInput);
    const options = {
      method: 'POST',
      url: 'https://judge0-ce.p.rapidapi.com/submissions',
      params: {base64_encoded: 'true', wait: true, fields: '*'},
      headers: {
        'content-type': 'application/json',
        'Content-Type': 'application/json',
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
        'X-RapidAPI-Key': 'f2f34b5fedmsh24f6250d41bb281p1fe116jsn0d726f8b0608'
      },
      data: {"language_id":"54","source_code": base64_encoded_code,"stdin": base64_encoded_input}
      // data: {
      //   "source_code": "#include <stdio.h>\n\nint main(void) {\n  char name[10];\n  scanf(\"%s\", name);\n  printf(\"hello, %s\n\", name);\n  return 0;\n}",
      //   "language_id": 4,
      //   "stdin": "world"
      // }
    };
    console.log(base64_encoded_code);
    axios.request(options).then(function (response) {
      const base64_decoded_output = base64_decode(response.data.stdout);
      setSampleOutput(base64_decoded_output);
    }).catch(function (error) {
      console.error(error);
    });
  }

  return (
    <div className="mainWrap">
      <div className="aside">
        <div className="asideInner">
          <div className="logo">
            <img className="logoImage" src="/code-sync.png" alt="logo" />
          </div>
          <h3>Connected</h3>
          <div className="clientsList">
            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </div>
        </div>
        <button className="btn copyBtn">Copy ROOM ID</button>
        <button className="btn leaveBtn">Leave</button>
      </div>
      <div className="editorWrap">
        <Editor
          socketRef={socketRef}
          roomId={roomId}
          onCodeChange={(code) => {
            codeRef.current = code;
          }}
        />
        <div classsName="submit">
          <input className="sampleInput"
            onChange={(e) => setSampleInput(e.target.value)}
          />
          <button className="btn submitBtn" 
            onClick={() => submitCode()}
          >Submit</button>
          <div>
            {sampleOutput}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;
