import { SignIn } from "@clerk/nextjs";
import {
  Container,
  Toolbar,
  AppBar,
  Typography,
  Button,
  Box,
  Link,
} from "@mui/material";
import Header from "../../header";

export default function SignInPage() {
  return (
    <Container maxWidth="100vw" style={{ background: "lightblue" }}>
      <Header />
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
      >
        <Typography variant="h4">Sign In</Typography>
        <SignIn />
      </Box>
    </Container>
  );
}
