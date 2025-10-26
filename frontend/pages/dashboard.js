import { useEffect, useState } from "react";

export default function Dashboard() {
  const [emails, setEmails] = useState([]);
  const [count, setCount] = useState(15);
  const [classified, setClassified] = useState(null);
  const [loading, setLoading] = useState(false);
  const API_BASE = "http://localhost:4000";

  useEffect(() => {
    // optional: check login status
  }, []);

  const fetchEmails = async () => {
    setLoading(true);
    const res = await fetch(`${API_BASE}/api/gmail/messages?count=${count}`, {
      credentials: "include" // session cookie
    });
    if (!res.ok) {
      alert("Error fetching emails. Are you logged in?");
      setLoading(false);
      return;
    }
    const data = await res.json();
    setEmails(data.emails || []);
    setLoading(false);
  };

  const classify = async () => {
    const key = localStorage.getItem("OPENAI_KEY");
    if (!key) return alert("Save OpenAI key on home page first.");
    setLoading(true);
    const res = await fetch(`${API_BASE}/api/classify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emails, openaiKey: key })
    });
    const data = await res.json();
    setClassified(data.classified || []);
    setLoading(false);
  };

  return (
    <div className="p-8">
      <div className="mb-4 flex items-center gap-3">
        <button className="px-3 py-2 bg-gray-800 text-white rounded" onClick={fetchEmails}>Fetch emails</button>
        <input className="border p-1 w-20" value={count} onChange={e=>setCount(e.target.value)} />
        <button className="px-3 py-2 bg-green-600 text-white rounded" onClick={classify}>Classify</button>
      </div>

      {loading && <div>Working...</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="font-bold">Fetched Emails</h2>
          {emails.map(e => (
            <div key={e.id} className="p-3 border rounded my-2">
              <div className="text-sm text-gray-600">{e.from} • {e.date}</div>
              <div className="font-medium">{e.subject}</div>
              <div className="text-sm">{e.snippet}</div>
            </div>
          ))}
        </div>

        <div>
          <h2 className="font-bold">Classified</h2>
          {classified ? classified.map(c => (
            <div key={c.id} className="p-3 border rounded my-2">
              <div className="text-xs text-gray-500">{c.subject}</div>
              <div className="text-lg font-semibold">{c.category}</div>
              <div className="text-sm">{c.reason}</div>
            </div>
          )) : <div>Not classified yet</div>}
        </div>
      </div>
    </div>
  );
}
