import React, { useState } from "react";
import { v4 as uuidV4 } from "uuid";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
const Home = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const symb2 = "{ . . }";
  const createNewRoom = (e) => {
    e.preventDefault();
    const id = uuidV4();
    setRoomId(id);
    toast.success("Your New Room is Ready!");
  };
  const joinRoom = () => {
    if (!roomId || !username) {
      toast.error("ROOM ID & username is required");
      return;
    }

    // Redirect
    navigate(`/editor/${roomId}`, {
      state: {
        username,
      },
    });
  };
  return (
    <div className="homePageWrapper">
      <div className="formWrapper">
        <h2 className="form-title">&lt;CodePair/&gt;</h2>
        <div className="inputGroup">
          <input
            type="text"
            className="inputBox"
            placeholder="Enter your Room ID"
            onChange={(e) => setRoomId(e.target.value)}
            value={roomId}
            // onKeyUp={handleInputEnter}
          />
          <input
            type="text"
            className="inputBox"
            placeholder="Enter your Name"
            onChange={(e) => setUsername(e.target.value)}
            value={username}
            // onKeyUp={handleInputEnter}
          />
          <button className="btn joinBtn" onClick={joinRoom}>
            Join
          </button>
          <span className="createInfo">
            or create a &nbsp;
            <a onClick={createNewRoom} href="" className="createNewBtn">
              new room
            </a>
          </span>
        </div>
      </div>
      <h3 className="symb1">&lt;/&gt;</h3>
      <h3 className="symb2">{symb2}</h3>
    </div>
  );
};

export default Home;
