import Head from "next/head";
import { AppBar, Toolbar, Box, Typography, Button, Link } from "@mui/material";
import { SignedIn, SignedOut, UserButton, UserProfile } from "@clerk/nextjs";
import styles from "../styles/header.module.scss";
export default function Header() {
  return (
    <Box>
      <Head>
        <title>Smart Flashcard Generator</title>
        <meta name="description" content="Create flashcards from your text." />
      </Head>
      <AppBar position="static" className={styles.appBar}>
        <Toolbar className={styles.toolbar}>
          <Typography variant="h6" className={styles.title}>
            <Link href="/" className={styles.link}>
              Smart Flashcard Generator
            </Link>
          </Typography>
          <SignedOut>
            <Button className={styles.button} href="/sign-in">
              Sign In
            </Button>
            <Button className={styles.button} href="/sign-up">
              Sign Up
            </Button>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
