"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { LoadingOverlay } from "@/components/loading-overlay";
import api from "@/utils/axios";
import { Camera, Brain, Bell, BarChart3, ChefHat, Mic, ArrowRight, Shield, Users, Star } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthUser = async () => {
      try {
        const res = await api.get("/auth/me");
        if (res.status === 200) {
          setIsAuthenticated(true);
        }
      } catch (error: unknown) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuthUser();
  }, [router]);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push("/fridge");
    } else {
      router.push("/auth");
    }
  };

  const handleTryDemo = () => {
    if (isAuthenticated) {
      router.push("/dashboard");
    } else {
      router.push("/auth");
    }
  };

  if (loading) {
    return <LoadingOverlay />;
  }

  const features = [
    {
      icon: <Camera className="h-8 w-8 text-[#5EB1FF]" />,
      title: "Smart Scanning",
      description: "Scan barcodes, photos, and receipts with AI-powered recognition",
      benefits: ["Instantly identify food items", "Automatic expiry date prediction", "Multiple item detection from receipts"],
    },
    {
      icon: <Brain className="h-8 w-8 text-[#5EB1FF]" />,
      title: "AI Nutrition Analysis",
      description: "Get detailed nutrition information and personalized recommendations",
      benefits: ["Accurate calorie and macro tracking", "Personalized meal suggestions", "Smart portion recommendations"],
    },
    {
      icon: <Mic className="h-8 w-8 text-[#5EB1FF]" />,
      title: "Voice Food Journaling",
      description: "Log your meals with voice-to-text and get AI companion feedback",
      benefits: ["Quick meal logging with voice", "AI companion feedback and motivation", "Track eating patterns and feelings"],
    },
    {
      icon: <Bell className="h-8 w-8 text-[#5EB1FF]" />,
      title: "Expiry Notifications",
      description: "Never waste food again with smart expiration alerts",
      benefits: ["Real-time expiry notifications", "Food waste reduction", "Money saving alerts"],
    },
    {
      icon: <ChefHat className="h-8 w-8 text-[#5EB1FF]" />,
      title: "Recipe Recommendations",
      description: "Get personalized recipes based on your available ingredients",
      benefits: ["Use ingredients before they expire", "Discover new recipes", "Reduce food waste creatively"],
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-[#5EB1FF]" />,
      title: "Analytics Dashboard",
      description: "Track your nutrition goals and food consumption patterns",
      benefits: ["Visual nutrition tracking", "Progress monitoring", "Health insights and trends"],
    },
  ];

  const stats = [
    { number: "95%", label: "Food Waste Reduction" },
    { number: "50+", label: "Smart Features" },
    { number: "24/7", label: "AI Companion" },
    { number: "100%", label: "Free to Use" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <Image src="/kulkasku-logo-1.png" alt="KulkasKu Logo" width={120} height={120} className="drop-shadow-lg" />
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              <span className="text-[#5EB1FF]">KulkasKu</span>
              <br />
              Smart Fridge Management
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Revolutionize your kitchen with AI-powered food management. Track nutrition, reduce waste, and get personalized meal
              recommendations with your intelligent companion.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleGetStarted}
                className="bg-[#5EB1FF] text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-600 transition-colors flex items-center space-x-2 shadow-lg">
                <span>{isAuthenticated ? "Go to Fridge" : "Get Started"}</span>
                <ArrowRight className="h-5 w-5" />
              </button>

              <button
                onClick={handleTryDemo}
                className="border-2 border-[#5EB1FF] text-[#5EB1FF] px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#5EB1FF] hover:text-white transition-colors">
                {isAuthenticated ? "View Dashboard" : "Try Demo"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-[#5EB1FF] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Powerful Features for Smart Food Management</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover how KulkasKu transforms your kitchen experience with cutting-edge AI technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-8 hover:shadow-lg transition-shadow">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="bg-blue-100 p-3 rounded-lg">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                </div>

                <p className="text-gray-600 mb-6">{feature.description}</p>

                <ul className="space-y-2">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-center space-x-2 text-sm text-gray-700">
                      <div className="w-2 h-2 bg-[#5EB1FF] rounded-full"></div>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How KulkasKu Works</h2>
            <p className="text-xl text-gray-600">Simple steps to transform your food management</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-[#5EB1FF] text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold mb-4">Scan & Add</h3>
              <p className="text-gray-600">
                Use our smart scanner to add items to your virtual fridge. Scan barcodes, take photos, or process entire receipts.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-[#5EB1FF] text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold mb-4">Track & Journal</h3>
              <p className="text-gray-600">
                Log your meals with voice notes and get AI-powered nutrition analysis. Track your eating patterns and health
                goals.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-[#5EB1FF] text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold mb-4">Get Recommendations</h3>
              <p className="text-gray-600">
                Receive personalized recipe suggestions, nutrition tips, and expiry alerts to minimize waste and maximize health.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Why Choose KulkasKu?</h2>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <Shield className="h-6 w-6 text-[#5EB1FF] mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Reduce Food Waste</h3>
                    <p className="text-gray-600">
                      Smart expiry tracking and recipe suggestions help you use ingredients before they spoil, reducing waste by
                      up to 95%.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Users className="h-6 w-6 text-[#5EB1FF] mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Improve Health</h3>
                    <p className="text-gray-600">
                      AI-powered nutrition tracking and personalized meal recommendations help you maintain a balanced diet and
                      achieve your health goals.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Star className="h-6 w-6 text-[#5EB1FF] mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Save Time & Money</h3>
                    <p className="text-gray-600">
                      Automated inventory management and smart shopping suggestions save you time planning meals and money on
                      groceries.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#5EB1FF] to-blue-600 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-6">Ready to Get Started?</h3>
              <p className="mb-8 text-blue-100">
                Join thousands of users who are already transforming their kitchen experience with KulkasKu.
              </p>

              <div className="space-y-4">
                <button
                  onClick={handleGetStarted}
                  className="w-full bg-white text-[#5EB1FF] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  {isAuthenticated ? "Go to Your Fridge" : "Start Free Today"}
                </button>

                {!isAuthenticated && <p className="text-sm text-blue-100 text-center">No credit card required • Free forever</p>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <Image src="/kulkasku-logo-1.png" alt="KulkasKu" width={40} height={40} />
              <span className="text-xl font-bold">KulkasKu</span>
            </div>

            <div className="text-gray-400 text-center md:text-right">
              <p>&copy; 2025 KulkasKu. All rights reserved.</p>
              <p className="mt-1">Smart Fridge Management for Everyone</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
