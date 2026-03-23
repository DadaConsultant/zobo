import Link from "next/link";

export default function InterviewNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">🔗</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Interview Not Found</h1>
        <p className="text-gray-500 mb-2">
          This interview link is invalid, expired, or has been closed by the recruiter.
        </p>
        <p className="text-sm text-gray-400">
          Please contact the recruiter for a new link.
        </p>
      </div>
    </div>
  );
}
