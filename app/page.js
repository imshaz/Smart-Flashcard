"use client";

import getStripe from "@/utils/get-stripe";
import { useState, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Header from "./header";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { useEffect } from "react";
export default function Home() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [subscribed, setSubscribed] = useState(false);
  const [userPlan, setUserPlan] = useState(null);
  const getUserSubscriptionPlan = async (userId) => {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        return userDocSnap.data().subscriptionPlan || null;
      } else {
        console.warn(`No user document found for user ID: ${userId}`);
        return null;
      }
    } catch (error) {
      console.error("Error retrieving subscription plan:", error);
      throw new Error("Failed to retrieve subscription plan.");
    }
  };

  useEffect(() => {
    const fetchUserPlan = async () => {
      if (user) {
        try {
          const plan = await getUserSubscriptionPlan(user.id);
          setUserPlan(plan);
          setSubscribed(true);

          console.log({ plan });
        } catch (error) {
          setSubscribed(false);
          console.error("Error fetching user plan:", error);
        } finally {
          // setLoading(false);
        }
      }
    };

    fetchUserPlan();
  }, [user]);
  const str = `
      [
        {
          "id": 1,
          "color": "lightcoral",
          "front": "Seamless Text Input",
          "back": "Effortlessly input your content and let our advanced software handle the rest. Our system simplifies flashcard creation, making it a breeze to organize your study material."
        },
        {
          "id": 2,
          "color": "lightsteelblue",
          "front": "Intelligent Flashcards",
          "back": "Leverage our AI's capabilities to transform your text into well-structured flashcards. Our technology ensures precise and efficient breakdowns, tailored for optimal learning."
        },
        {
          "id": 3,
          "color": "lightgreen",
          "front": "Accessible Across Devices",
          "back": "Enjoy the flexibility to access your flashcards from any device, anytime. Our platform enables seamless studying on the go, ensuring your material is always within reach."
        }
      ]

      `;

  const [flashcards, setFlashcards] = useState(JSON.parse(str));
  const [flipped, setFlipped] = useState([]);

  const handleCardClick = (id) => {
    setFlipped((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSubmit = async (amount) => {
    // Check for user authentication
    if (!user) {
      router.push(`/sign-in`);
      return;
    }

    // Determine the subscription plan based on the amount
    let subscriptionPlan;
    switch (amount) {
      case 0:
        subscriptionPlan = "Free";
        break;
      case 5:
        subscriptionPlan = "Basic";
        break;
      case 10:
        subscriptionPlan = "Pro";
        break;
      default:
        console.error("Invalid subscription amount");
        return;
    }

    try {
      // Create a checkout session
      const response = await fetch("/api/checkout_session", {
        method: "POST",
        headers: {
          origin: "http://localhost:3000",
          amount: amount,
          plan: subscriptionPlan,
        },
      });

      const checkoutSessionJson = await response.json();

      if (response.status !== 200) {
        console.error(
          "Error creating checkout session:",
          checkoutSessionJson.message
        );
        return;
      }

      // Initialize Stripe and redirect to checkout
      const stripe = await getStripe();
      const { error } = await stripe.redirectToCheckout({
        sessionId: checkoutSessionJson.id,
      });

      if (error) {
        console.warn("Error redirecting to checkout:", error.message);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };

  const pricingRef = useRef();
  const executeScroll = () => {
    console.log({ user, subscribed });
    if (user && subscribed) {
      router.push("/generate");
    } else {
      pricingRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="w-screen min-h-screen bg-gradient-to-b from-blue-50 to-blue-200">
      <Header />

      {/* Hero Section */}
      <div
        className="relative text-center py-60 px-6 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1488590528505-98d2b5aba04b')",
        }}
      >
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 text-white">
          <h1 className="text-6xl font-extrabold mb-6 leading-tight">
            Welcome to Smart Flashcard Generator
          </h1>
          <p className="text-xl mb-8 max-w-4xl mx-auto">
            Revolutionize your study sessions with AI-powered flashcards.
            Convert your text effortlessly into interactive study tools and
            enhance your learning journey.
          </p>
          <button
            className="mt-4 px-12 py-4 bg-white text-indigo-600 font-semibold rounded-md shadow-lg hover:bg-gray-200 transition-all duration-300"
            onClick={executeScroll}
          >
            {userPlan ? "Go to Generator" : "Get Started"}
          </button>
          {/* <button
            className="mt-4 px-12 py-4 bg-white text-indigo-600 font-semibold rounded-md shadow-lg hover:bg-gray-200 transition-all duration-300"
            onClick={executeScroll}
          >
            Get Started
          </button> */}
        </div>
      </div>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Features Section */}
        <div className="my-16 px-4 text-center">
          <h2 className="text-4xl font-semibold mb-8">Features</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12">
            {flashcards.map((flashcard, index) => (
              <div
                key={index}
                className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="p-6" onClick={() => handleCardClick(index)}>
                  <div
                    className={`relative w-full h-48 transform transition-transform duration-500 perspective-1000 ${
                      flipped[index] ? "rotate-y-180" : ""
                    }`}
                  >
                    <div className="absolute w-full h-full flex items-center justify-center backface-hidden bg-gray-100">
                      <h3 className="text-xl font-medium">{flashcard.front}</h3>
                    </div>
                    <div className="absolute w-full h-full flex items-center justify-center bg-gray-200 transform rotate-y-180 backface-hidden">
                      <h3 className="text-xl font-medium">{flashcard.back}</h3>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Section */}
        <div
          className="my-32 px-4 py-16 bg-gray-50 text-center"
          ref={pricingRef}
        >
          <h2 className="text-4xl font-semibold mb-12 text-gray-800">
            Pricing Plans
          </h2>
          <p className="text-lg mb-8 text-gray-600">
            Choose the plan that best fits your needs and start creating
            AI-powered flashcards today.
          </p>

          <div className="my-32 px-4 py-16 bg-gray-50 text-center">
            <h2 className="text-4xl font-semibold mb-12 text-gray-800">
              Pricing Plans
            </h2>
            <p className="text-lg mb-8 text-gray-600">
              Choose the plan that best fits your needs and start creating
              AI-powered flashcards today.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* Trial Plan */}
              <div
                className={`p-8 border border-gray-300 rounded-lg bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 ${
                  userPlan === "Trial" ? "border-blue-500" : ""
                }`}
              >
                <h3 className="text-3xl font-bold mb-4 text-gray-800">Trial</h3>
                <p className="text-xl mb-4 text-gray-600">Free for 30 days</p>
                <ul className="list-disc list-inside mb-6 text-left space-y-2 text-gray-700">
                  <li>Full feature access</li>
                  <li>30-day trial period</li>
                  <li>Limited to 100 flashcards</li>
                </ul>
                <button
                  className={`px-6 py-3 ${
                    userPlan === "Trial" ? "bg-blue-600" : "bg-gray-800"
                  } text-white font-semibold rounded-md hover:bg-gray-700 transition-all duration-300`}
                  onClick={() => handleSubmit(0)}
                >
                  {userPlan === "Trial" ? "Current Plan" : "Start Trial"}
                </button>
              </div>

              {/* Basic Plan */}
              <div
                className={`p-8 border border-gray-300 rounded-lg bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 ${
                  userPlan === "Basic" ? "border-blue-500" : ""
                }`}
              >
                <h3 className="text-3xl font-bold mb-4 text-gray-800">Basic</h3>
                <p className="text-xl mb-4 text-gray-600">$5 / month</p>
                <ul className="list-disc list-inside mb-6 text-left space-y-2 text-gray-700">
                  <li>Access to basic features</li>
                  <li>Store up to 500 flashcards</li>
                  <li>Email support</li>
                </ul>
                <button
                  className={`px-6 py-3 ${
                    userPlan === "Basic" ? "bg-blue-600" : "bg-gray-800"
                  } text-white font-semibold rounded-md hover:bg-gray-700 transition-all duration-300`}
                  onClick={() => handleSubmit(5)}
                >
                  {userPlan === "Basic" ? "Current Plan" : "Subscribe"}
                </button>
              </div>

              {/* Pro Plan */}
              <div
                className={`p-8 border border-gray-300 rounded-lg bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 ${
                  userPlan === "Pro" ? "border-blue-500" : ""
                }`}
              >
                <h3 className="text-3xl font-bold mb-4 text-gray-800">Pro</h3>
                <p className="text-xl mb-4 text-gray-600">$10 / month</p>
                <ul className="list-disc list-inside mb-6 text-left space-y-2 text-gray-700">
                  <li>Unlimited flashcards</li>
                  <li>Priority support</li>
                  <li>Advanced analytics</li>
                  <li>Customizable features</li>
                </ul>
                <button
                  className={`px-6 py-3 ${
                    userPlan === "Pro" ? "bg-blue-600" : "bg-gray-800"
                  } text-white font-semibold rounded-md hover:bg-gray-700 transition-all duration-300`}
                  onClick={() => handleSubmit(10)}
                >
                  {userPlan === "Pro" ? "Current Plan" : "Subscribe"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
