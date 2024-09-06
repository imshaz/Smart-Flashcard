module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],

  theme: {
    extend: {
      transform: {
        "rotate-y-180": "rotateY(180deg)",
        "rotate-y-0": "rotateY(0deg)",
      },
      perspective: {
        1000: "1000px",
      },
    },
  },
  plugins: [],
};
