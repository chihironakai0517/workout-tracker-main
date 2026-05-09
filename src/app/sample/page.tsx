"use client";
import { useRouter } from 'next/navigation';
export default function Sample() {
  const router = useRouter();
  return (
    <div>
      <h1>Sample</h1>
      <button onClick={() => router.push('/')}
        className="bg-blue-500 text-white px-4 py-2 rounded-md"
        >Home</button>
    </div>
  );
}
