import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    // Chỉ định cho Tailwind biết code nằm ở đâu để nó quét class
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Cấu hình Font chữ ở đây
      fontFamily: {
        // Gán font mặc định (sans) thành biến --font-open-sans mà ta đã khai báo ở layout
        sans: ["var(--font-open-sans)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;