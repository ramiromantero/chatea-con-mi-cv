export default function Footer() {
  return (
    <footer className="py-6 text-center text-xs text-tinta-suave">
      Hecho por Ramiro Mantero ·{" "}
      <a
        href="https://github.com/ramiromantero"
        target="_blank"
        rel="noopener noreferrer"
        className="text-acento underline decoration-acento/40 underline-offset-2 transition-colors hover:text-white"
      >
        GitHub
      </a>{" "}
      ·{" "}
      <a
        href="https://linkedin.com/in/ramiro-mantero-319931186"
        target="_blank"
        rel="noopener noreferrer"
        className="text-acento underline decoration-acento/40 underline-offset-2 transition-colors hover:text-white"
      >
        LinkedIn
      </a>
    </footer>
  );
}
