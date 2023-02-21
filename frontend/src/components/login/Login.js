import React from "react";
import {
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
} from "@mui/material";
import "./Login.css";

const Login = () => {
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
              />
            </Container>
            <Container className="login__password">
              <Container className="login__flex">
                <Typography className="login__text">Password</Typography>
                <Link href="#" underline="none">
                  <Typography className="login__forgot">
                    Forgot password?
                  </Typography>
                </Link>
              </Container>
              <TextField
                className="login__typography"
                variant="outlined"
                placeholder="••••••••••••"
                fullWidth
                type={"password"}
                required
                style={{ backgroundColor: "#FAFAFA" }}
                size="small"
              />
            </Container>
            <Button className="login__button" type="submit" fullWidth>
              Login
            </Button>
            <Link href="#" underline="none">
              <Typography className="login__create">
                Create new account
              </Typography>
            </Link>
          </Paper>
        </Grid>
      </div>
    </div>
  );
};

export default Login;
