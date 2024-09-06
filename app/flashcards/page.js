"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { useRouter } from "next/navigation";
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Typography,
} from "@mui/material";
import Header from "../header";

export default function Flashcards() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [flashcards, setFlashcards] = useState([]);
  const router = useRouter();

  useEffect(() => {
    async function getFlashcards() {
      if (!user) return;
      const docRef = doc(collection(db, "users"), user.id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const collections = docSnap.data().flashcards || [];
        setFlashcards(collections);
      } else {
        await setDoc(docRef, { flashcards: [] });
      }
    }
    getFlashcards();
  }, [user]);

  if (!isLoaded || !isSignedIn) {
    return <></>;
  }

  const handleCardClick = (id) => {
    router.push(`/flashcard?id=${id}`);
  };

  return (
    <Container
      maxWidth="100vw"
      className="bg-gradient-to-r from-blue-100 to-blue-300 py-12"
    >
      <Header />
      <Typography
        variant="h4"
        className="text-center text-gray-800 font-bold mb-8"
      >
        Your Flashcard Collections
      </Typography>
      <Grid container spacing={4}>
        {flashcards.map((flashcard, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card className="transition-transform transform hover:scale-105 shadow-lg rounded-lg overflow-hidden">
              <CardActionArea onClick={() => handleCardClick(flashcard.name)}>
                <CardContent className="p-6 bg-white">
                  <Typography
                    variant="h6"
                    className="text-gray-900 font-semibold"
                  >
                    {flashcard.name}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
