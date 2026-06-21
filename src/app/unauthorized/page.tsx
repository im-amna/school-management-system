import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">403</h1>
        <p className="text-lg text-gray-700 mb-6">
          Aapko is page ko dekhne ki permission nahi hai.
        </p>
        <Link
          href="/login"
          className="text-blue-600 hover:underline"
        >
          Login page pe wapas jao
        </Link>
      </div>
    </div>
  );
}