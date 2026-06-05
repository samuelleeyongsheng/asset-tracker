import { Suspense } from "react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/landing/Hero";
import FeatureGrid from "@/components/landing/FeatureGrid";
import TickerStrip from "@/components/landing/TickerStrip";
import CtaSection from "@/components/landing/CtaSection";
import { AuthErrorToast } from "@/components/auth/auth-error-toast";

export default function LandingPage(){
  {/* return() <></> like a wrapper of different element */}
  return(
    <div>
      {/* Reads ?error=... from the URL (set by failed Google linking) and toasts it.
          Wrapped in Suspense because useSearchParams needs a boundary on a static page. */}
      <Suspense>
        <AuthErrorToast />
      </Suspense>
      <Navbar />
      <main>
        <Hero/>
        <TickerStrip/>
        <FeatureGrid/>
        <CtaSection/>
      </main>
      <Footer />

    </div>
  )
}

