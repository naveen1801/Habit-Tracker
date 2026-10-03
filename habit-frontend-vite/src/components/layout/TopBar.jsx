export default function TopBar(){

  return(
    <div className="flex justify-between items-center">

      <input
        placeholder="Search habits..."
        className="bg-gray-100 px-4 py-2 rounded-full w-80"
      />

      <div className="flex gap-4 items-center">
        <span>🔔</span>
        <span>⚙️</span>
        <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
      </div>

    </div>
  )
}