import { useEffect, useState } from "react";
import { Container, Row, Col, Form, FormControl, ListGroup } from "react-bootstrap";
// import { Message, User } from "./types";
import { io } from "socket.io-client";
// import jwt from "jsonwebtoken";
import React from "react";
import { batch, useDispatch, useSelector } from "react-redux";
import { setSearchedUser } from "../../redux/actions/index";

const token = localStorage.getItem("accessToken");
console.log("token: ", token);

const socket = io("http://localhost:3001", { auth: { token }, transports: ["websocket"] });

const Home = () => {
  const [username, setUsername] = useState("");
  const [userList, setUserList] = useState([]);
  //let [userId, setUserId] = useState("");
  //const [email, setEmail] = useState("")
  const [message, setMessage] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [activeuser, setActiveuser] = useState(false);
  // const [currentUser, setCurrentUser] = useState(null);
  const searchedUser = useSelector((state) => state.searchedUser);
  const userId = searchedUser._id;

  console.log("searchedUser: ", searchedUser);
  console.log("username: ", username);
  console.log("userId", userId);

  const dispatch = useDispatch();
  //const username = useSelector((store) => store.userInfo.username);

  useEffect(() => {
    socket.on("welcome", (welcomeMessage) => {
      console.log(welcomeMessage);

      socket.on("loggedIn", (onlineUsersList) => {
        console.log("logged in event:", onlineUsersList);
        setLoggedIn(true);
        setOnlineUsers(onlineUsersList);
      });

      socket.on("updateOnlineUsersList", (onlineUsersList) => {
        console.log("A new user connected/disconnected");
        setOnlineUsers(onlineUsersList);
      });
    });
    socket.on("newMessage", (newMessage) => {
      console.log(newMessage);
      setChatHistory([...chatHistory, newMessage.message]);
    });
  }, [chatHistory]);

  // const submitUsername = () => {
  //   // here we will be emitting a "setUsername" event (the server is already listening for that)
  //   socket.emit("setUsername", { username });
  // };
  const submitUserId = () => {
    // here we will be emitting a "setUsername" event (the server is already listening for that)
    console.log("SUBMIT user ID");
    socket.emit("setUsername", { username, userId });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = `http://localhost:3001/users?username=${username}`;

    try {
      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error("Network response was not ok. Failed to register user");
      }

      const data = await response.json();
      console.log("data from fetch: ", data);
      setUserList(data);
    } catch (error) {
      console.error("There was a problem with the getting the user list:", error);
      //const errorMessage = "Problem with the getting the user list. Please try again later.";
    }
  };

  const sendMessage = () => {
    const newMessage = {
      sender: userId,
      // sender: username,
      text: message,
      createdAt: new Date().toLocaleString("en-US"),
    };
    socket.emit("sendMessage", { message: newMessage });
    setChatHistory([...chatHistory, newMessage]);
  };

  return (
    <Container fluid>
      <Row style={{ height: "95vh" }} className="my-3">
        <Col md={9} className="d-flex flex-column justify-content-between">
          {/* LEFT COLUMN */}
          {/* TOP AREA: USERNAME INPUT FIELD */}
          <Form
            onSubmit={handleSubmit}
            // onSubmit={(e) => {
            //   e.preventDefault();
            //   // submitUsername();

            //   submitUserId();
            // }}
          >
            <FormControl placeholder="Search by username" value={username} onChange={(e) => setUsername(e.target.value)} disabled={loggedIn} />
          </Form>

          <ListGroup className={activeuser ? "bg-warning" : ""}>
            <ListGroup.Item key={searchedUser._id}>
              {searchedUser.username} | {searchedUser.email}
            </ListGroup.Item>
          </ListGroup>

          {/* )} */}
          {/* MIDDLE AREA: CHAT HISTORY */}
          <ListGroup>
            {chatHistory.map((message, index) => (
              <ListGroup.Item key={index}>
                {<strong>{message.sender === userId ? "ME" : message.sender}</strong>} | {message.text} at {message.createdAt}
              </ListGroup.Item>
            ))}
          </ListGroup>
          {/* BOTTOM AREA: NEW MESSAGE */}
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
          >
            <FormControl placeholder="Write your message here" value={message} onChange={(e) => setMessage(e.target.value)} disabled={!loggedIn} />
          </Form>
        </Col>
        <Col md={3}>
          {/* ONLINE USERS SECTION */}
          {/* <div className="mb-3">Connected users:</div>
          {onlineUsers.length === 0 && <ListGroup.Item>Log in to check who is online!!</ListGroup.Item>}
          <ListGroup>
            {onlineUsers.map((user) => (
              <ListGroup.Item key={user.socketId}>{user.username}</ListGroup.Item>
            ))}
          </ListGroup> */}

          {/* FILTERED USERS SECTION */}
          <div className="mb-3">Searched users:</div>
          {userList.length === 0 && <ListGroup.Item>No users in the db !</ListGroup.Item>}
          <ListGroup>
            {userList.map((user) => (
              <ListGroup.Item
                key={user._id}
                onClick={() => {
                  setActiveuser(true);
                  dispatch(setSearchedUser(user));
                }}
              >
                <span>
                  {user.username} | {user.email}
                </span>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
