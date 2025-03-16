// app/(main)/layout.tsx
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "../../styles/main-layout.css";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="main-layout">
            <Header />
            <main className="container my-5">{children}</main>
            <Footer />
        </div>
    );
}
