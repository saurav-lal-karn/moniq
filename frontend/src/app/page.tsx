import { Metadata } from "next";
import LandingPageClient from "@/components/landing/LandingPageClient";

export const metadata: Metadata = {
    title: "Moniq | Finance Tracker",
    description:
        "Take control of your household budget, track shared expenses, and gain insights into your family's financial health with Moniq.",
};

export default function LandingPage() {
    return <LandingPageClient />;
}
