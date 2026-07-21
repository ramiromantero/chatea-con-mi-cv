import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chateá con mi CV — Ramiro Mantero",
  description:
    "Un chat interactivo para hacerle preguntas al CV de Ramiro Mantero. 100% client-side, sin API de LLM: motor de matching por keywords.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
