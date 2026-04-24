'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, HandHeart, ShoppingBag, ArrowRight, ShieldCheck, Globe, Users } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const PLATES = [
  '/hero/plate1.png',
  '/hero/plate2.png',
  '/hero/plate3.png',
  '/hero/plate4.png',
  '/hero/plate5.png',
  '/hero/plate6.png',
];

export default function LandingPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextPlate = () => {
    setCurrentIndex((prev) => (prev + 1) % PLATES.length);
  };

  const prevPlate = () => {
    setCurrentIndex((prev) => (prev - 1 + PLATES.length) % PLATES.length);
  };

  useEffect(() => {
    const timer = setInterval(nextPlate, 5000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
      <Navbar />

      <main className="flex-grow relative">
        {/* Curved Background Shape */}
        <div className="absolute top-0 right-0 w-[60vw] h-[60vw] bg-primary-light rounded-full -translate-y-1/2 translate-x-1/4 -z-10 animate-pulse-slow"></div>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <div className="z-10">
              <div className="flex items-center space-x-8 mb-12 animate-fade-in">
                {['Breakfast', 'Lunch', 'Dinner'].map((cat) => (
                  <Link href="/browse" key={cat} className="text-gray-400 font-heading font-extrabold uppercase tracking-widest text-xs hover:text-primary-dark cursor-pointer transition-colors">
                    {cat}
                  </Link>
                ))}
              </div>
              <div className="mb-12">
                <span className="text-3xl font-heading font-extrabold text-primary-dark mb-4 block animate-slide-up">$12 - $35</span>
                <h1 className="text-6xl md:text-8xl font-heading font-extrabold text-gray-900 leading-[1.1] tracking-tight mb-8 animate-slide-up delay-100">
                  Healthy Food <br />
                  <span className="text-primary-dark">Shared with Love</span>
                </h1>
                <p className="max-w-md text-lg text-gray-500 font-body leading-relaxed mb-12 animate-slide-up delay-200">
                  Reducing waste by connecting surplus fresh meals from local kitchens to neighbors in need. Join our sustainable community.
                </p>
                <div className="flex items-center gap-6 animate-slide-up delay-300">
                  <Link href="/choose-role" className="btn-primary px-12 py-5 text-xl shadow-2xl shadow-primary/30 hover:scale-105 transition-transform">
                    Join Now
                  </Link>
                  <Link href="/browse" className="font-heading font-extrabold text-gray-900 flex items-center group">
                    View Listings <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex items-center space-x-6 text-gray-400 animate-fade-in delay-500">
                <Link href="#" className="hover:text-primary-dark transition-colors"><Globe size={20} /></Link>
                <Link href="#" className="hover:text-primary-dark transition-colors"><Users size={20} /></Link>
                <Link href="#" className="hover:text-primary-dark transition-colors"><Heart size={20} /></Link>
              </div>
            </div>

            {/* Right: Rotating Food Display */}
            <div className="relative h-[600px] flex items-center justify-center">
              {/* Main Plate */}
              <div className="relative z-20 animate-float">
                <div className="w-[400px] h-[400px] md:w-[500px] md:h-[500px] rounded-full shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] overflow-hidden border-[15px] border-white bg-white">
                  <img 
                    key={currentIndex}
                    src={PLATES[currentIndex]} 
                    alt="Main Dish" 
                    className="w-full h-full object-cover animate-spin-slow animate-fade-in" 
                  />
                </div>
                
                {/* Decorative Play Button */}
                <button 
                  onClick={() => router.push('/about')}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-primary-dark shadow-xl hover:scale-110 cursor-pointer transition-transform z-30 group"
                >
                  <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-current border-b-[12px] border-b-transparent ml-2 group-hover:scale-110 transition-transform"></div>
                </button>
              </div>

              {/* Orbiting Plates */}
              <div className="absolute inset-0 animate-spin-container">
                <Link href="/browse" className="absolute top-[10%] left-[50%] -translate-x-1/2 w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white cursor-pointer hover:scale-110 hover:z-50 transition-transform block">
                  <img src="/hero/plate2.png" alt="Side Dish" className="w-full h-full object-cover" />
                </Link>
                <Link href="/browse" className="absolute top-[30%] right-[10%] w-20 h-20 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white cursor-pointer hover:scale-110 hover:z-50 transition-transform block">
                  <img src="/hero/plate3.png" alt="Side Dish" className="w-full h-full object-cover" />
                </Link>
                <Link href="/browse" className="absolute bottom-[20%] right-[20%] w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white cursor-pointer hover:scale-110 hover:z-50 transition-transform block">
                  <img src="/hero/plate1.png" alt="Side Dish" className="w-full h-full object-cover" />
                </Link>
              </div>

              {/* Orbit Path (dashed line) */}
              <div className="absolute w-[550px] h-[550px] border-2 border-dashed border-gray-200 rounded-full z-0"></div>

              {/* Navigation Arrows */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-10 z-30">
                <button 
                  onClick={prevPlate}
                  className="w-16 h-16 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-gray-400 hover:text-primary-dark hover:scale-110 cursor-pointer transition-all active:scale-95"
                >
                   <ArrowRight className="rotate-180" />
                </button>
                <button 
                  onClick={nextPlate}
                  className="w-16 h-16 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-gray-400 hover:text-primary-dark hover:scale-110 cursor-pointer transition-all active:scale-95"
                >
                   <ArrowRight />
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* Info Section (Quick Mission) */}
        <section className="py-32 bg-white border-y border-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
               <div className="flex flex-col items-center text-center group">
                  <div className="bg-primary-light p-7 rounded-[2.5rem] text-primary-dark mb-8 group-hover:scale-110 transition-transform duration-500">
                    <ShieldCheck size={44} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-2xl font-heading font-extrabold text-gray-900 mb-4 tracking-tight uppercase">Safe & Trusted</h3>
                  <p className="text-gray-500 font-body leading-relaxed max-w-xs">
                    Every donation is verified. We prioritize food safety and community trust above all else.
                  </p>
               </div>
               <div className="flex flex-col items-center text-center group">
                  <div className="bg-primary-light p-7 rounded-[2.5rem] text-primary-dark mb-8 group-hover:scale-110 transition-transform duration-500">
                    <Globe size={44} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-2xl font-heading font-extrabold text-gray-900 mb-4 tracking-tight uppercase">Eco Friendly</h3>
                  <p className="text-gray-500 font-body leading-relaxed max-w-xs">
                    Join us in the fight against climate change by preventing surplus food from becoming waste.
                  </p>
               </div>
               <div className="flex flex-col items-center text-center group">
                  <div className="bg-primary-light p-7 rounded-[2.5rem] text-primary-dark mb-8 group-hover:scale-110 transition-transform duration-500">
                    <Users size={44} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-2xl font-heading font-extrabold text-gray-900 mb-4 tracking-tight uppercase">Community First</h3>
                  <p className="text-gray-500 font-body leading-relaxed max-w-xs">
                    Strengthening local bonds by making it easier than ever to share resources with neighbors.
                  </p>
               </div>
            </div>
          </div>
        </section>

        {/* Role Selection Section */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-4xl font-heading font-extrabold text-gray-900 mb-4 tracking-tight">Choose Your Impact</h2>
              <p className="text-gray-500 font-body">Be part of the cycle of giving.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Donor Card */}
              <div className="group bg-white p-12 rounded-[3rem] shadow-sm border border-gray-100 hover:shadow-2xl hover:shadow-primary/10 transition-all">
                <div className="bg-primary-light p-6 rounded-3xl text-primary-dark w-fit mb-8 group-hover:bg-primary transition-all">
                  <HandHeart size={48} strokeWidth={1.5} />
                </div>
                <h3 className="text-3xl font-heading font-extrabold text-gray-900 mb-4">I want to Donate</h3>
                <p className="text-gray-500 font-body mb-10 text-lg leading-relaxed">
                  Join hundreds of restaurants and individuals sharing their surplus food.
                </p>
                <Link href="/register?role=donor" className="flex items-center text-primary-dark font-heading font-extrabold text-xl group/link">
                  Register as Donor
                  <ArrowRight className="ml-2 group-hover/link:translate-x-2 transition-transform" />
                </Link>
              </div>

              {/* Receiver Card */}
              <div className="group bg-white p-12 rounded-[3rem] shadow-sm border border-gray-100 hover:shadow-2xl hover:shadow-primary/10 transition-all">
                <div className="bg-primary-light p-6 rounded-3xl text-primary-dark w-fit mb-8 group-hover:bg-primary transition-all">
                  <ShoppingBag size={48} strokeWidth={1.5} />
                </div>
                <h3 className="text-3xl font-heading font-extrabold text-gray-900 mb-4">I'm looking for Food</h3>
                <p className="text-gray-500 font-body mb-10 text-lg leading-relaxed">
                  Access fresh, high-quality surplus food from donors near you.
                </p>
                <Link href="/register?role=receiver" className="flex items-center text-primary-dark font-heading font-extrabold text-xl group/link">
                  Register as Receiver
                  <ArrowRight className="ml-2 group-hover/link:translate-x-2 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Detailed Mission Section */}
        <section id="mission" className="py-32 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              <div>
                <h2 className="text-5xl md:text-6xl font-heading font-extrabold text-gray-900 leading-tight mb-10 tracking-tight">
                  Our Mission: <br />
                  <span className="text-primary-dark underline decoration-primary-light decoration-8 underline-offset-[12px]">Zero Hunger, Zero Waste</span>
                </h2>
                <p className="text-xl text-gray-600 font-body leading-relaxed mb-12 max-w-xl">
                  We believe that food is a fundamental right, not a privilege. Our platform eliminates the barriers between those with abundance and those in need, ensuring every meal serves its purpose.
                </p>
                <div className="flex flex-col sm:flex-row gap-6">
                  <Link href="/about" className="btn-primary inline-flex items-center justify-center">
                    Read Our Full Story
                  </Link>
                  <Link href="/contact" className="px-8 py-4 rounded-2xl font-heading font-extrabold text-gray-900 border border-gray-100 hover:bg-gray-50 transition-all flex items-center justify-center">
                    Get in Touch
                  </Link>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square bg-gray-50 rounded-[4rem] relative overflow-hidden shadow-inner flex items-center justify-center p-16">
                   <Heart size={300} className="text-primary-light opacity-50" fill="currentColor" />
                   <div className="absolute inset-0 flex items-center justify-center p-12 text-center z-10">
                      <p className="text-4xl font-heading font-extrabold text-gray-900 leading-snug">
                        "Transforming surplus into smiles, one plate at a time."
                      </p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-32 bg-white border-t border-gray-100">
           <div className="max-w-5xl mx-auto px-4 text-center">
              <h2 className="text-5xl md:text-7xl font-heading font-extrabold text-gray-900 mb-10 tracking-tighter uppercase">
                Ready to make a <span className="text-primary-dark">difference?</span>
              </h2>
              <p className="text-xl text-gray-500 font-body mb-16 max-w-2xl mx-auto">
                Join thousands of people already sharing and receiving food on FoodShare. 
                Your journey towards zero waste starts here.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                <Link href="/register" className="btn-primary px-12 py-5 text-xl shadow-2xl shadow-primary/30 hover:scale-105 transition-transform">
                  Join FoodShare Today
                </Link>
                <Link href="/contact" className="px-12 py-5 rounded-2xl font-heading font-extrabold text-xl text-gray-900 border-2 border-gray-100 hover:bg-gray-50 transition-all flex items-center group">
                  Contact Support
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
           </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
