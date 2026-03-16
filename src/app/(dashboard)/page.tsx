export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Office Spaces</h3>
          <p className="mt-2 text-3xl font-bold text-indigo-600">0</p>
          <p className="text-sm text-gray-500">Listed spaces</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Bookings</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">0</p>
          <p className="text-sm text-gray-500">Total bookings</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Products</h3>
          <p className="mt-2 text-3xl font-bold text-blue-600">0</p>
          <p className="text-sm text-gray-500">Active listings</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a href="/dashboard/spaces/new" className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50">
            <span className="text-4xl mb-2">🏢</span>
            <span className="font-medium">List Office Space</span>
          </a>
          <a href="/dashboard/products/new" className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50">
            <span className="text-4xl mb-2">📦</span>
            <span className="font-medium">Add Product</span>
          </a>
          <a href="/dashboard/bookings" className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50">
            <span className="text-4xl mb-2">📅</span>
            <span className="font-medium">View Bookings</span>
          </a>
          <a href="/dashboard/profile" className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50">
            <span className="text-4xl mb-2">⚙️</span>
            <span className="font-medium">Profile Settings</span>
          </a>
        </div>
      </div>
    </div>
  );
}
