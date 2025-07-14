import { Navbar } from "@/components/navbar";
import { Header } from "@/components/header";
import { ReactNode } from "react";

export default function MainPageLayout({
    children
}: {
    children: ReactNode
}) {
    return (
        <>
            <Header />
            <main className="p-4">
                {children}
            </main>
            <Navbar />
        </>
    )
}