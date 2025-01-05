'use client'

const Loading = ()=>{
    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex space-x-2">
          <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce delay-0"></div>
          <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce delay-200"></div>
          <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce delay-400"></div>
        </div>
        <style jsx>{`
          @keyframes bounce {
            0%, 80%, 100% {
              transform: scale(0);
            }
            40% {
              transform: scale(1);
            }
          }
          .animate-bounce {
            animation: bounce 1.2s infinite;
          }
          .delay-200 {
            animation-delay: 0.2s;
          }
          .delay-400 {
            animation-delay: 0.4s;
          }
        `}</style>
      </div>
    )
}

export default Loading;