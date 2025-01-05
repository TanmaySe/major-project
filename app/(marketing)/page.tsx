'use client'
import { Button } from "@/components/ui/button";
import { useConvexAuth } from "convex/react";
import Link from "next/link";
import { SignInButton, UserButton, SignUpButton } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { ArrowDown, Sparkles, Users, BarChart3, Star } from "lucide-react";

export default function Marketing() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  return (
    <div className="relative overflow-hidden">
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-md py-4 shadow-lg"
      >
        <div className="container mx-auto flex items-center justify-between px-6">
          <motion.h1 
            className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
            whileHover={{ scale: 1.05 }}
          >
            ProjectPilot
          </motion.h1>
          <nav>
            <div className="flex space-x-6">
              {!isLoading && !isAuthenticated && (
                <motion.div className="flex space-x-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <SignInButton mode="modal">
                    <Button variant="ghost" className="hover:bg-blue-50">
                      Log in
                    </Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      Register
                    </Button>
                  </SignUpButton>
                </motion.div>
              )}
              {!isLoading && isAuthenticated && (
                <motion.div className="flex items-center space-x-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Button variant="default" asChild className="bg-blue-600 hover:bg-blue-700">
                    <Link href="/workspace">Enter Pilot</Link>
                  </Button>
                  <UserButton afterSignOutUrl="/"/>
                </motion.div>
              )}
            </div>
          </nav>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white relative overflow-hidden z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="container mx-auto text-center px-4 relative z-10"
        >
          <motion.h1 
            className="text-6xl font-extrabold leading-tight mb-6"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            Streamline Your Projects with <br/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-yellow-400">
              Precision and Ease
            </span>
          </motion.h1>
          <motion.p 
            className="text-xl opacity-90 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            Empower your team with powerful tools to manage, collaborate, and succeed.
          </motion.p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6">
              Start Free Trial <Sparkles className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <ArrowDown className="h-8 w-8 text-white/80" />
        </motion.div>
      </section>

      {/* Core Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.h2 
            className="text-4xl font-bold text-center text-gray-800 mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Core Features
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[ 
              { icon: <Users className="h-8 w-8" />, title: "Task Management", desc: "Effortlessly organize tasks with real-time updates and seamless tracking." },
              { icon: <Star className="h-8 w-8" />, title: "Collaboration", desc: "Collaborate effectively with clients and team members in real-time." },
              { icon: <BarChart3 className="h-8 w-8" />, title: "Advanced Analytics", desc: "Gain insights with powerful analytics to drive better decision-making." }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ y: -5 }}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <div className="bg-blue-100 p-3 rounded-lg w-fit mb-4 text-blue-600">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.h2 
            className="text-4xl font-bold text-center text-gray-800 mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            What Our Users Say
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[ 
              { name: "John Doe", text: "ProjectPilot has revolutionized our workflow. Highly recommend for teams seeking efficiency!" },
              { name: "Jane Smith", text: "A game-changer for project management. Simple, yet powerful!" }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
                className="bg-gray-50 p-8 rounded-xl shadow-lg"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.name[0]}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 ml-4">{testimonial.name}</h3>
                </div>
                <p className="text-gray-600 italic">{testimonial.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-6">
          <motion.h2 
            className="text-4xl font-bold text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Choose Your Plan
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[ 
              { price: "19", name: "Basic Plan" },
              { price: "49", name: "Pro Plan", popular: true },
              { price: "99", name: "Enterprise Plan" }
            ].map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ y: -10 }}
                className={`bg-white rounded-xl shadow-xl overflow-hidden ${plan.popular ? 'ring-2 ring-yellow-400 transform scale-105' : ''}`}
              >
                {plan.popular && (
                  <div className="bg-yellow-400 text-center py-2 text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                <div className="p-8">
                  <h3 className="text-3xl font-bold text-gray-800">${plan.price}/mo</h3>
                  <p className="text-gray-600 mt-2">{plan.name}</p>
                  <Button 
                    variant="secondary" 
                    className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Choose Plan
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <motion.h1 
              className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-4 md:mb-0"
              whileHover={{ scale: 1.05 }}
            >
              ProjectPilot
            </motion.h1>
            <div className="flex space-x-6">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
