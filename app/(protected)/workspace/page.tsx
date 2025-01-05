'use client'
import React from 'react';
import Lottie from 'react-lottie';
import animationData from '../../../public/start.json';

const WorkspacePage = () => {
    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
            preserveAspectRatio: "xMidYMid slice"
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-[#e4e7eb]">
            <div className="text-center">
                <Lottie 
                    options={defaultOptions}
                    height={400}
                    width={400}
                />
                <p className="text-xl font-semibold mt-4 text-transparent bg-clip-text animate-gradient-text">
                    Start piloting your project managing journey. Click to begin!
                </p>
            </div>

            <style jsx>{`
                @keyframes gradientText {
                    0% {
                        background: linear-gradient(to right, #2c3e50, #4a148c); /* Dark Blue to Dark Violet */
                        background-clip: text;
                        color: transparent;
                    }
                    25% {
                        background: linear-gradient(to right, #1a237e, #7b1fa2); /* Deep Blue to Purple */
                        background-clip: text;
                        color: transparent;
                    }
                    50% {
                        background: linear-gradient(to right, #0d47a1, #8e24aa); /* Strong Blue to Violet */
                        background-clip: text;
                        color: transparent;
                    }
                    75% {
                        background: linear-gradient(to right, #212121, #6a1b9a); /* Black to Dark Purple */
                        background-clip: text;
                        color: transparent;
                    }
                    100% {
                        background: linear-gradient(to right, #2c3e50, #4a148c); /* Dark Blue to Dark Violet */
                        background-clip: text;
                        color: transparent;
                    }
                }

                .animate-gradient-text {
                    animation: gradientText 5s ease infinite;
                    background-size: 400% 400%;
                }
            `}</style>
        </div>
    );
}

export default WorkspacePage;
