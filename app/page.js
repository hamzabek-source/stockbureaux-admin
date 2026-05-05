import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-10 rounded shadow text-center">
        <h1 className="text-2xl font-bold mb-6">Stock Bureaux — Admin</h1>
        <div className="flex flex-col gap-4">
          <Link href="/admin/login" className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700">
            Accéder à l'admin →
          </Link>
        </div>
      </div>
    </div>
  )
}