import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/landing/Hero";
import FeatureGrid from "@/components/landing/FeatureGrid";
import TickerStrip from "@/components/landing/TickerStrip";
import CtaSection from "@/components/landing/CtaSection";

export default function LandingPage(){
  {/* return() <></> like a wrapper of different element */}
  return(
    <div>
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

