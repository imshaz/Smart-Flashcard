"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import getStripe from "@/utils/get-stripe";
import { useSearchParams } from "next/navigation";
import {
  CircularProgress,
  Typography,
  Container,
  Box,
  Link,
} from "@mui/material";
import Header from "../header";
import { useUser, isSignedIn } from "@clerk/nextjs";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebase";

export default function ResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const session_id = searchParams.get("session_id");
  const plan = searchParams.get("plan");

  //   console.log({ session_id, plan });

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);
  const [subscribed, setSubscribed] = useState(false);

  const user = useUser();

  console.log({ user });

  // Function to store user's subscription plan in Clerk's publicMetadata
  const storeUserSubscription = async (user, plan) => {
    console.log({ user, plan });

    // Update Clerk's public metadata for the user

    try {
      // Update the user's metadata to store the selected subscription plan
      const userDocRef = doc(db, "users", user.user.id);

      // Update the user's subscription plan
      await setDoc(
        userDocRef,
        {
          subscriptionPlan: plan,
          updatedAt: new Date(), // Optional: Track when the subscription was updated
        },
        { merge: true }
      );

      // Optionally, redirect the user to another page or show a success message
      console.log("Subscription plan updated successfully:", plan);
    } catch (error) {
      console.error("Error updating subscription plan:", error);
    }
  };

  useEffect(() => {
    const fetchCheckoutSession = async () => {
      console.log({ USER: !user.user });
      if (!user?.user?.id) return;

      try {
        const res = await fetch(
          `/api/checkout_session?session_id=${session_id}`
        );
        const sessionData = await res.json();

        console.log({ sessionData });
        console.log({ plan: sessionData.metadata.plan });
        storeUserSubscription(user, sessionData.metadata.plan);

        if (res.ok) {
          setSession(sessionData);
        } else {
          setError(sessionData.error);
        }
      } catch (err) {
        setError("An error occurred while retrieveing the session.".err);
      } finally {
        setLoading(false);
      }
    };
    fetchCheckoutSession();
  }, [user?.user?.id]);

  if (loading) {
    return (
      <Container maxWidth="100vw" sx={{ textAlign: "center", mt: 4 }}>
        <CircularProgress />
        <Typography variant="h6">Loading...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="100vw" sx={{ textAlign: "center", mt: 4 }}>
        <Typography variant="h6">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container className="max-w-screen-xl mx-auto px-6 py-12 bg-gradient-to-r from-blue-50 via-white to-blue-50">
      <Header />
      <div className="text-center mt-12">
        {session.payment_status === "paid" ? (
          <>
            <h4 className="text-3xl font-extrabold mb-6 text-gray-800">
              Thank You for Your Purchase!
            </h4>
            <div className="bg-white shadow-lg rounded-lg p-6 mx-auto max-w-lg">
              <p className="text-lg font-medium text-gray-700">
                {/* Session ID: {session_id} */}
              </p>
              <p className="mt-4 text-base text-gray-600">
                Your payment has been successfully processed. We will send you
                an email with the order details shortly.
              </p>
              <h5 className="mt-6 text-xl font-semibold text-indigo-700">
                <Link
                  href="/generate"
                  className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-md shadow-md hover:bg-indigo-700 transition-colors duration-300"
                >
                  Generate Flashcards
                </Link>
              </h5>
            </div>
          </>
        ) : (
          <>
            <h4 className="text-3xl font-extrabold mb-6 text-gray-800">
              Payment Failed
            </h4>
            <div className="bg-white shadow-lg rounded-lg p-6 mx-auto max-w-lg">
              <p className="text-base text-gray-600">
                Unfortunately, your payment was not successful.{" "}
                <Link href="/" className="text-indigo-600 hover:underline">
                  Please try again
                </Link>
                .
              </p>
            </div>
          </>
        )}
      </div>
    </Container>
  );
}
