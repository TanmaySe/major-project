'use client'
import { Button } from "@/components/ui/button";
import { useConvexAuth } from "convex/react";
import Link from "next/link";
import { SignInButton , UserButton,SignUpButton} from "@clerk/clerk-react";

export default function Marketing() {
  const {isAuthenticated,isLoading} = useConvexAuth()
  return (
    <div>
      <header className="bg-white py-6 shadow-md">
        <div className="flex items-center justify-between px-6">
          <h1 className="text-3xl font-bold text-gray-800">ProjectPilot</h1>
          <nav>
            <div className="flex space-x-6">
            {!isLoading && !isAuthenticated && (
            <>
            <SignInButton mode="modal">
                <Button variant="ghost" size="sm">
                    Log in
                </Button>
            </SignInButton>
            <SignUpButton mode="modal">
                <Button variant="ghost" size="sm">
                    Register
                </Button>
            </SignUpButton>

            </>
            )}
            {!isLoading && isAuthenticated && (
            <>
                <Button variant="default" asChild>
                <Link href="/dashboard">Enter Pilot
                </Link>
                </Button>
                <UserButton/>
            </>
            )}
            </div>
          </nav>
        </div>
      </header>

      <section id="hero" className="bg-gradient-to-r from-blue-600 to-indigo-700 py-20 text-white text-center">
        <div>
          <h1 className="text-5xl font-extrabold leading-tight">Streamline Your Projects with Precision and Ease</h1>
          <p className="mt-4 text-lg opacity-90">
            Empower your team with powerful tools to manage, collaborate, and succeed.
          </p>
          <Button variant="secondary" className="mt-6">Start Free Trial</Button>
        </div>
      </section>

      <section id="features" className="py-20 bg-gray-100">
        <div className="px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800">Core Features</h2>
          <div className="grid grid-cols-3 gap-8 mt-12">
            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition duration-300">
              <h3 className="text-xl font-semibold text-gray-800">Task Management</h3>
              <p className="mt-2 text-gray-600">Effortlessly organize tasks with real-time updates and seamless tracking.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition duration-300">
              <h3 className="text-xl font-semibold text-gray-800">Collaboration</h3>
              <p className="mt-2 text-gray-600">Collaborate effectively with clients and team members in real-time.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition duration-300">
              <h3 className="text-xl font-semibold text-gray-800">Advanced Analytics</h3>
              <p className="mt-2 text-gray-600">Gain insights with powerful analytics to drive better decision-making.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-20 bg-white">
        <div className="px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800">What Our Users Say</h2>
          <div className="grid grid-cols-2 gap-8 mt-12">
            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition duration-300">
              <h3 className="text-lg font-semibold text-gray-800">John Doe</h3>
              <p className="mt-2 text-gray-600">
                "ProjectPilot has revolutionized our workflow. Highly recommend for teams seeking efficiency!"
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition duration-300">
              <h3 className="text-lg font-semibold text-gray-800">Jane Smith</h3>
              <p className="mt-2 text-gray-600">
                "A game-changer for project management. Simple, yet powerful!"
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
        <div className="px-6">
          <h2 className="text-3xl font-bold text-center">Choose Your Plan</h2>
          <div className="grid grid-cols-3 gap-8 mt-12">
            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition duration-300">
              <h3 className="text-xl font-semibold text-gray-800">$19/mo</h3>
              <p className="mt-2 text-gray-600">Basic Plan</p>
              <Button variant="secondary" className="mt-4 bg-indigo-600 hover:bg-indigo-500">Choose Plan</Button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition duration-300">
              <h3 className="text-xl font-semibold text-gray-800">$49/mo</h3>
              <p className="mt-2 text-gray-600">Pro Plan</p>
              <Button variant="secondary" className="mt-4 bg-indigo-600 hover:bg-indigo-500">Choose Plan</Button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition duration-300">
              <h3 className="text-xl font-semibold text-gray-800">$99/mo</h3>
              <p className="mt-2 text-gray-600">Enterprise Plan</p>
              <Button variant="secondary" className="mt-4 bg-indigo-600 hover:bg-indigo-500">Choose Plan</Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-white py-6 shadow-inner">
        <div className="px-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">ProjectPilot</h1>
            <div>
              <a href="#" className="text-gray-600 mx-2 hover:text-indigo-600">Privacy Policy</a>
              <a href="#" className="text-gray-600 mx-2 hover:text-indigo-600">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
