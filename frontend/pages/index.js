export default function Home() {
  const handleLogin = () => {
    // redirect to backend Google OAuth entry
    window.location.href = "http://localhost:4000/auth/google";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-xl w-full p-8 bg-white rounded shadow">
        <h1 className="text-2xl font-bold mb-4">MagicSlides — Email Classifier</h1>
        <p className="mb-6">Login with Google to fetch your last emails and classify them using GPT-4o.</p>
        <button onClick={handleLogin}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Login with Google
        </button>
        <div className="mt-6">
          <label className="block mb-2">Your OpenAI Key (saved to localStorage)</label>
          <input id="openai-key" className="w-full p-2 border rounded" placeholder="sk-..." />
          <div className="mt-2 flex gap-2">
            <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={()=>{
              const k = document.getElementById("openai-key").value.trim();
              if(k) { localStorage.setItem("OPENAI_KEY", k); alert("Saved."); }
            }}>Save Key</button>
            <button className="px-3 py-1 bg-gray-200 rounded" onClick={()=>{
              localStorage.removeItem("OPENAI_KEY"); alert("Removed.");
            }}>Clear Key</button>
          </div>
        </div>
      </div>
    </div>
  );
}
