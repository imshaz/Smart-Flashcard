"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import { useSearchParams } from "next/navigation";
import {
  CardContent,
  Card,
  Grid,
  Box,
  Container,
  TextField,
  Typography,
  Paper,
  CardActionArea,
  Button,
  DialogActions,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogContentText,
} from "@mui/material";
import Header from "../header";

export default function Flashcard() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [flashcards, setFlashcards] = useState([]);
  const [flipped, setFlipped] = useState([]);

  console.log({ flipped });
  const searchParams = useSearchParams();
  const search = searchParams.get("id");

  useEffect(() => {
    async function getFlashcard() {
      if (!search || !user) return;
      const colRef = collection(doc(collection(db, "users"), user.id), search);
      const docs = await getDocs(colRef);
      const flashcards = [];

      docs.forEach((doc) => {
        flashcards.push({ id: doc.id, ...doc.data() });
      });
      setFlashcards(flashcards);
      console.log(typeof flashcards);
    }
    getFlashcard();
  }, [user, search]);

  const handleCardClick = (id) => {
    console.log(id);
    setFlipped((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (!isLoaded || !isSignedIn) {
    return <></>;
  }

  return (
    <Container maxWidth="100vw" className="bg-light-blue-100 py-12">
      <Header />
      <Grid container spacing={4} className="mt-8">
        {flashcards.map((flashcard, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card className="relative w-full h-64 overflow-hidden">
              <CardActionArea
                onClick={() => handleCardClick(index)}
                className="relative w-full h-full"
              >
                <CardContent className="relative w-full h-full p-0">
                  <Box className="relative w-full h-full perspective-1000">
                    <div
                      className={`card-inner absolute w-full h-full ${
                        flipped[index] ? "rotate-y-180" : "rotate-y-0"
                      }`}
                    >
                      <div className="absolute w-full h-full bg-white flex items-center justify-center p-4 backface-hidden">
                        <Typography
                          variant="h5"
                          className="text-gray-800 font-semibold text-center"
                        >
                          {flashcard.front}
                        </Typography>
                      </div>
                      <div className="absolute w-full h-full bg-gray-800 text-white flex items-center justify-center p-4 backface-hidden rotate-y-180">
                        <Typography
                          variant="h5"
                          className="font-semibold text-center"
                        >
                          {flashcard.back}
                        </Typography>
                      </div>
                    </div>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
