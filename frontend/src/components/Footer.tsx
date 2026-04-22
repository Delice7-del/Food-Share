import Link from 'next/link';
import { Utensils, Heart, Mail, Instagram, Linkedin, Github, ArrowUp, Info } from 'lucide-react';

const Footer = () => {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="bg-white px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4 relative">
                
                {/* Left Panel: Big CTA */}
                <div className="bg-gray-50 rounded-[1.5rem] p-8 md:p-12 flex flex-col items-center justify-center text-center group transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 border border-gray-100">
                    <h2 className="text-3xl md:text-5xl font-heading font-extrabold text-gray-900 mb-6 tracking-tighter leading-tight">
                        Ending Hunger: <br />
                        <span className="text-primary-dark">Join the Cause</span>
                    </h2>
                    <p className="text-gray-500 font-body text-sm mb-8 max-w-sm">
                        Be the reason someone smiles today. Start your journey as a donor or receiver.
                    </p>
                    <Link 
                        href="/register" 
                        className="btn-primary px-8 py-4 text-lg shadow-lg hover:scale-105 active:scale-95 uppercase tracking-widest"
                    >
                        Access Portal
                    </Link>
                </div>

                {/* Right Panel: Brand & Contact */}
                <div className="bg-gray-50 rounded-[1.5rem] p-8 md:p-12 flex flex-col text-gray-900 relative group transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 border border-gray-100">
                    {/* Brand Header */}
                    <div className="flex justify-between items-start mb-8">
                        <div className="flex items-center">
                            <div className="bg-primary-light p-2.5 rounded-xl mr-3">
                                <Utensils className="h-5 w-5 text-primary-dark" />
                            </div>
                            <span className="text-2xl font-heading font-extrabold tracking-tighter text-gray-900">FoodShare</span>
                        </div>
                        <div className="flex flex-col text-right space-y-2">
                            <Link href="/about" className="text-[10px] font-heading font-bold uppercase tracking-widest text-gray-400 hover:text-primary-dark transition-colors">About</Link>
                            <Link href="/browse" className="text-[10px] font-heading font-bold uppercase tracking-widest text-gray-400 hover:text-primary-dark transition-colors">Browse</Link>
                            <Link href="/contact" className="text-[10px] font-heading font-bold uppercase tracking-widest text-gray-400 hover:text-primary-dark transition-colors">Contacts</Link>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2 mb-8">
                        <p className="text-lg font-heading font-bold text-gray-900">+250 788 000 000</p>
                        <p className="text-gray-400 font-body text-sm">support@foodshare.org</p>
                    </div>

                    {/* Social Icons */}
                    <div className="flex space-x-3 mb-8">
                        {[Instagram, Linkedin, Github, Mail].map((Icon, i) => (
                            <Link key={i} href="#" className="p-3 rounded-full border border-gray-200 text-gray-400 hover:text-primary-dark hover:border-primary-light hover:bg-primary-light transition-all duration-300">
                                <Icon size={16} />
                            </Link>
                        ))}
                    </div>

                    {/* Disclaimer Box */}
                    <div className="mt-auto bg-white border border-gray-100 rounded-xl p-4 flex items-start space-x-3">
                        <Info className="text-primary-dark shrink-0" size={16} />
                        <p className="text-[10px] text-gray-400 leading-relaxed">
                            FoodShare is designed for community impact. Feel free to reach out for support or to report any issues with food quality or safety.
                        </p>
                    </div>

                    {/* Back to Top Floating Button */}
                    <button 
                        onClick={scrollToTop}
                        className="absolute bottom-6 right-6 lg:-right-8 bg-primary-light p-3 rounded-xl text-primary-dark hover:scale-110 active:scale-95 transition-all shadow-md cursor-pointer border border-primary/10"
                        title="Back to Top"
                    >
                        <ArrowUp size={18} strokeWidth={3} />
                    </button>
                </div>

            </div>
            
            <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-gray-50 flex justify-between items-center text-[9px] font-heading font-bold uppercase tracking-[0.2em] text-gray-300">
                <span>&copy; {new Date().getFullYear()} FoodShare Platform</span>
                <span className="flex items-center">Made with <Heart size={8} className="mx-1 text-primary fill-primary" /> for the community</span>
            </div>
        </footer>
    );
};

export default Footer;
