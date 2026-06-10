import { Playfair_Display, DM_Sans, Poppins, Lora } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
});

export default function CartaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${playfair.variable} ${dmSans.variable} ${poppins.variable} ${lora.variable}`}
    >
      {children}
    </div>
  );
}
