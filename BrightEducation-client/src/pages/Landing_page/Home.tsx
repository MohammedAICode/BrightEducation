import Navbar from '../../components/navbar/Navbar';
import Footer from '../../components/footer/Footer';
import Hero from './Hero';
import Stats from './Stats';
import About from './About';
import Features from './Features';
import Programs from './Programs';
import Testimonials from './Testimonials';
import Contact from './Contact';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Hero />
      <Stats />
      <About />
      <Features />
      <Programs />
      <Testimonials />
      <Contact />
      <Footer />
    </div>
  );
}
