import Link from 'next/link';
import { Utensils, Heart, Mail, Info } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="flex items-center mb-4">
                            <Utensils className="h-6 w-6 text-orange-500" />
                            <span className="ml-2 text-xl font-bold text-gray-900">FoodShare</span>
                        </Link>
                        <p className="text-gray-500 max-w-sm mb-6">
                            FoodShare is a community-driven platform dedicated to reducing food waste and supporting those in need through direct food sharing.
                        </p>
                        <div className="flex items-center text-orange-600 font-medium">
                            <Heart size={18} className="mr-2 fill-orange-600" />
                            <span>Made with love for the planet.</span>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Quick Links</h3>
                        <ul className="space-y-3">
                            <li><Link href="/" className="text-gray-500 hover:text-orange-600 transition-colors">Find Food</Link></li>
                            <li><Link href="/about" className="text-gray-500 hover:text-orange-600 transition-colors">About Us</Link></li>
                            <li><Link href="/contact" className="text-gray-500 hover:text-orange-600 transition-colors">Contact Support</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Legal</h3>
                        <ul className="space-y-3">
                            <li><Link href="/privacy" className="text-gray-500 hover:text-orange-600 transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="text-gray-500 hover:text-orange-600 transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center bg-transparent">
                    <p className="text-gray-400 text-sm mb-4 md:mb-0">
                        &copy; {new Date().getFullYear()} FoodShare Platform. All rights reserved.
                    </p>
                    <div className="flex space-x-6">
                        <Link href="/contact" className="text-gray-400 hover:text-orange-600 transition-colors">
                            <Mail size={20} />
                        </Link>
                        <Link href="/about" className="text-gray-400 hover:text-orange-600 transition-colors">
                            <Info size={20} />
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
