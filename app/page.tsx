import ChatWindow from "@/components/ChatWindow";
import Footer from "@/components/Footer";
import SidePanel from "@/components/SidePanel";

export default function Home() {
  return (
    <main className="bg-aurora flex min-h-dvh flex-col">
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 px-4 pt-6 lg:flex-row lg:items-start">
        <SidePanel />
        <div className="flex min-h-[70dvh] max-h-[85dvh] flex-1 flex-col lg:h-[calc(100dvh-6.5rem)] lg:max-h-none lg:min-h-0">
          <ChatWindow />
        </div>
      </div>
      <Footer />
    </main>
  );
}
