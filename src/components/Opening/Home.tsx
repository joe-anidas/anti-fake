import { FC } from 'react';

import Hero from './Hero';
import Features from './Features';
import Contact from './Contact';
import Footer from './Footer';

const Home: FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
     
      <main className="flex-1">
        <Hero />
        <Features />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Home;