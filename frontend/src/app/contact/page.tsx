'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-grow">
        {/* Header */}
        <section className="bg-primary-light pt-32 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl md:text-7xl font-heading font-extrabold text-gray-900 mb-6">Contact Us</h1>
            <p className="max-w-2xl mx-auto text-xl text-gray-600 font-body">
              Have questions or suggestions? We'd love to hear from you. 
              Our team is here to help you get started.
            </p>
          </div>
        </section>

        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
              {/* Form */}
              <div className="bg-white p-10 md:p-12 rounded-[3rem] shadow-2xl shadow-primary/10 border border-gray-100">
                {submitted ? (
                  <div className="text-center py-20 animate-fade-in">
                    <div className="bg-green-100 p-6 rounded-full w-fit mx-auto mb-8 text-green-600">
                      <Send size={48} />
                    </div>
                    <h2 className="text-3xl font-heading font-extrabold text-gray-900 mb-4">Message Sent!</h2>
                    <p className="text-gray-500 font-body mb-8 text-lg">
                      Thank you for reaching out. We'll get back to you within 24 hours.
                    </p>
                    <button 
                      onClick={() => setSubmitted(false)}
                      className="btn-primary"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-heading font-bold text-gray-400 uppercase tracking-widest ml-1">Your Name</label>
                        <input type="text" required placeholder="John Doe" className="input-field" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-heading font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                        <input type="email" required placeholder="john@example.com" className="input-field" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-heading font-bold text-gray-400 uppercase tracking-widest ml-1">Subject</label>
                      <input type="text" required placeholder="How can we help?" className="input-field" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-heading font-bold text-gray-400 uppercase tracking-widest ml-1">Message</label>
                      <textarea required rows={5} placeholder="Type your message here..." className="input-field"></textarea>
                    </div>
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="btn-primary w-full py-5 text-xl flex items-center justify-center"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mr-2"></div>
                      ) : (
                        <Send size={20} className="mr-2" />
                      )}
                      {loading ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-col justify-center space-y-12">
                <div>
                  <h3 className="text-3xl font-heading font-extrabold text-gray-900 mb-6">Get in touch</h3>
                  <p className="text-gray-500 font-body text-lg leading-relaxed">
                    Prefer other ways to reach us? No problem. Here is our direct information. 
                    We are always open for partnerships and volunteer inquiries.
                  </p>
                </div>

                <div className="space-y-8">
                  <div className="flex items-center space-x-6">
                    <div className="bg-primary-light p-4 rounded-2xl text-primary-dark">
                      <Mail size={28} />
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-gray-400 uppercase tracking-widest text-xs">Email Us</h4>
                      <p className="text-xl font-heading font-bold text-gray-900">hello@foodshare.org</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="bg-primary-light p-4 rounded-2xl text-primary-dark">
                      <Phone size={28} />
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-gray-400 uppercase tracking-widest text-xs">Call Us</h4>
                      <p className="text-xl font-heading font-bold text-gray-900">+1 (555) 123-4567</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="bg-primary-light p-4 rounded-2xl text-primary-dark">
                      <MapPin size={28} />
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-gray-400 uppercase tracking-widest text-xs">Visit Our Hub</h4>
                      <p className="text-xl font-heading font-bold text-gray-900">123 Community Way, SF, CA</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 flex items-start">
                   <div className="bg-white p-3 rounded-xl mr-5 shadow-sm text-primary-dark">
                      <MessageSquare size={24} />
                   </div>
                   <div>
                      <h4 className="font-heading font-bold text-gray-900 mb-1">Live Chat</h4>
                      <p className="text-gray-500 text-sm font-body">Available Mon-Fri, 9am - 5pm PST for instant support.</p>
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
