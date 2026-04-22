'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Heart, Globe, Shield, Users, Coffee, Smile } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-grow relative">
        {/* Decorative Background Shape */}
        <div className="absolute top-0 left-0 w-[50vw] h-[50vw] bg-primary-light rounded-full -translate-y-1/2 -translate-x-1/4 -z-10 animate-pulse-slow"></div>

        {/* Header */}
        <section className="pt-16 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex items-center justify-center space-x-2 mb-6 animate-fade-in">
              <div className="w-8 h-px bg-primary-light"></div>
              <span className="text-primary-dark font-heading font-extrabold uppercase tracking-[0.3em] text-[10px]">Since 2023</span>
              <div className="w-8 h-px bg-primary-light"></div>
            </div>
            <span className="text-gray-400 font-heading font-bold uppercase tracking-widest text-[10px] mb-4 block animate-fade-in">Our Journey</span>
            <h1 className="text-6xl md:text-[8rem] font-heading font-extrabold text-gray-900 mb-8 tracking-tighter leading-[0.9] animate-slide-up">
              Shared Meals, <br />
              <span className="text-primary-dark underline decoration-primary-light decoration-[16px] underline-offset-[4px]">Stronger Communities.</span>
            </h1>
            <p className="max-w-3xl mx-auto text-2xl text-gray-500 font-body leading-relaxed animate-slide-up delay-100">
              FoodShare is more than a platform—it's a movement to rethink how we value surplus food and support our neighbors.
            </p>
          </div>
        </section>

        {/* How It Works (The Journey) */}
        <section className="py-40 bg-gray-50/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-24">
              <h2 className="text-4xl md:text-5xl font-heading font-extrabold text-gray-900 tracking-tight uppercase">How Food Travels</h2>
              <div className="w-24 h-2 bg-primary mx-auto mt-6 rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative">
               {/* Connecting Line (Desktop) */}
               <div className="hidden md:block absolute top-1/2 left-0 w-full h-px border-t-2 border-dashed border-gray-200 -z-10"></div>

               {[
                 { title: 'The Donor', desc: 'Local kitchens and individuals list surplus fresh food.', icon: Coffee, step: '01' },
                 { title: 'The Request', desc: 'Nearby neighbors in need browse and request items.', icon: Users, step: '02' },
                 { title: 'The Chat', desc: 'Both parties coordinate a safe pickup time.', icon: Smile, step: '03' },
                 { title: 'The Impact', desc: 'A meal is saved, and a community bond is formed.', icon: Globe, step: '04' }
               ].map((item, i) => (
                 <Link href="/browse" key={i} className="flex flex-col items-center text-center group cursor-pointer">
                    <div className="text-xs font-heading font-extrabold text-primary mb-4 tracking-widest">{item.step}</div>
                    <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center text-primary-dark mb-8 group-hover:scale-110 group-hover:shadow-primary/20 transition-all duration-500 border border-gray-50">
                       <item.icon size={36} strokeWidth={1.5} />
                    </div>
                    <h4 className="text-xl font-heading font-extrabold text-gray-900 mb-3 group-hover:text-primary-dark transition-colors">{item.title}</h4>
                    <p className="text-gray-500 font-body text-sm leading-relaxed max-w-[200px]">{item.desc}</p>
                 </Link>
               ))}
            </div>
          </div>
        </section>

        {/* Stats & Impact Section */}
        <section className="py-32 bg-white">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                 <div>
                    <h2 className="text-5xl font-heading font-extrabold text-gray-900 leading-tight mb-8">Making a Real Impact, <br /><span className="text-primary-dark">Together.</span></h2>
                    <p className="text-xl text-gray-500 font-body leading-relaxed mb-10">
                      Since our launch, we've focused on measurable change. Every number represents a family supported and a meal saved from waste.
                    </p>
                    <div className="grid grid-cols-2 gap-10">
                       <div className="border-l-4 border-primary-light pl-6">
                          <div className="text-4xl font-heading font-extrabold text-gray-900 mb-1">10k+</div>
                          <p className="text-gray-500 font-body text-sm uppercase tracking-widest font-bold">Meals Shared</p>
                       </div>
                       <div className="border-l-4 border-primary-light pl-6">
                          <div className="text-4xl font-heading font-extrabold text-gray-900 mb-1">5 Tons</div>
                          <p className="text-gray-500 font-body text-sm uppercase tracking-widest font-bold">Waste Saved</p>
                       </div>
                    </div>
                 </div>
                 <div className="relative">
                    <div className="aspect-[4/3] bg-primary-light rounded-[4rem] flex items-center justify-center p-20 shadow-2xl overflow-hidden group">
                       <Heart size={200} className="text-primary-dark opacity-10 group-hover:scale-150 transition-transform duration-[2000ms]" fill="currentColor" />
                       <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-white/80 backdrop-blur-md p-10 rounded-3xl border border-white shadow-xl text-center">
                             <span className="text-5xl font-heading font-extrabold text-primary-dark block mb-2">500+</span>
                             <span className="text-gray-500 font-heading font-bold uppercase tracking-widest text-xs">Active Community Donors</span>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
