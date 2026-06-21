import Link from "next/link";
import { IconLock, IconArrowLeft } from "@tabler/icons-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <IconLock size={32} className="text-red-500" />
        </div>
        <h1 className="text-5xl font-bold text-slate-800 mb-2">403</h1>
        <p className="text-lg font-semibold text-slate-700 mb-2">
          Access Denied
        </p>
        <p className="text-sm text-slate-400 mb-8">
          You don't have permission to view this page. 
          Please login with the correct account.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition"
        >
          <IconArrowLeft size={16} />
          Back to Login
        </Link>
      </div>
    </div>
  );
}