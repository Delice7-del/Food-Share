'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FoodForm from '@/components/FoodForm';
import ProtectedRoute from '@/components/ProtectedRoute';

const AddFoodPage = () => {
    return (
        <ProtectedRoute roles={['donor']}>
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Navbar />
                <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
                    <FoodForm />
                </main>
                <Footer />
            </div>
        </ProtectedRoute>
    );
};

export default AddFoodPage;
