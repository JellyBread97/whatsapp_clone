import React from "react";
import { Container, Grid, Paper, Typography, TextField, Button } from "@mui/material";
import { toast } from "react-toastify";
import { useState } from "react";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  console.log("formData:", formData);

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    // if (passwordStrength < 1) {
    //   toast.error("Password is too weak. Please choose a stronger password.");
    //   return;
    // }
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    };
    const endpoint = "http://localhost:3001/users/session";
    try {
      const response = await fetch(endpoint, options);
      if (!response.ok) {
        throw new Error("Network response was not ok. Failed to register user");
      }
      const data = await response.json();
      //dispatch(serUserInfoAction(data));

      console.log("Login data from fetch: ", data);
      localStorage.setItem("accessToken", `${data.accessToken}`);
      localStorage.setItem("refreshToken", `${data.refreshToken}`);
      //setIsRegistered(true);

      toast.success("Login successful!");
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
      const errorMessage = "Login failed. Please try again later.";

      toast.error(errorMessage);
    }
  };

  return (
    <div>
      <div className="login__spacer"></div>
      <div className="login">
        <h2 className="login__login">Login</h2>
        <Grid>
          <Paper className="login__paper">
            <Container className="login__email">
              <Typography className="login__text">Email</Typography>
              <TextField
                className="login__typography"
                variant="outlined"
                placeholder="example@email.com"
                fullWidth
                required
                style={{ backgroundColor: "#FAFAFA" }}
                size="small"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Container>
            <Container className="login__password">
              <Typography className="login__text">Password</Typography>
              <TextField
                className="login__typography"
                variant="outlined"
                placeholder="••••••••••••"
                fullWidth
                type={"password"}
                required
                style={{ backgroundColor: "#FAFAFA" }}
                size="small"
                name="password"
                value={formData.password}
                onChange={handleChange}
              />
            </Container>
            <Button className="login__button" type="submit" fullWidth onClick={handleSubmit}>
              Login
            </Button>
          </Paper>
        </Grid>
      </div>
    </div>
  );
};

export default Login;
