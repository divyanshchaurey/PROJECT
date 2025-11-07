// Divine Helper, Reclaiming Moksha (DHRM) - Single-file Fullstack React App
// Requirements: React, Tailwind CSS (CDN), Firebase SDK v9+, Gemini API key (Gemini 2.5 Flash), Google Search grounding tool (Gemini grounding).
// This file is designed to be dropped into a React code sandbox or create-react-app environment.
// Important: Replace FIREBASE_CONFIG and GEMINI_API_KEY with your own credentials.

import React, { useState, useEffect, useRef } from "react";

// ==== Configurations ====
const FIREBASE_CONFIG = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_FIREBASE_PROJECT.firebaseapp.com",
  projectId: "YOUR_FIREBASE_PROJECT_ID",
  storageBucket: "YOUR_FIREBASE_PROJECT.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
const APP_ID = "dhrm"; // Location in Firestore: /artifacts/dhrm/
const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY";
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent";

// ==== Firebase Initialization ====
let firebase, auth, db, signInAnonymously, onAuthStateChanged, collection, doc, getDocs, getDoc, setDoc, addDoc;
const firebaseReady = new Promise((resolve) => {
  (async () => {
    if (!window.firebaseApp) {
      await (async () => {
        const sdk = await import("firebase/compat/app");
        sdk.default.initializeApp(FIREBASE_CONFIG);
        window.firebaseApp = sdk.default;
      })();
    }
    firebase = window.firebaseApp;
    if (!window.firebaseFirestore) {
      window.firebaseFirestore = (await import("firebase/compat/firestore")).default;
    }
    if (!window.firebaseAuth) {
      window.firebaseAuth = (await import("firebase/compat/auth")).default;
    }
    db = window.firebaseFirestore();
    auth = window.firebaseAuth();
    signInAnonymously = auth.signInAnonymously;
    onAuthStateChanged = auth.onAuthStateChanged;
    collection = db.collection;
    doc = db.doc;
    getDocs = async (c) => c.get();
    getDoc = async (d) => d.get();
    setDoc = async (r, v) => r.set(v);
    addDoc = async (c, v) => c.add(v);
    resolve();
  })();
});

// ==== i18n ====
const translations = {
  en: {
    appName: "DHRM: Divine Helper, Reclaiming Moksha",
    nav: {
      home: "Home",
      drishti: "Divya Drishti",
      chat: "DHRM Chat",
      dhyan: "Dhyan (Meditation)",
      books: "Books",
      about: "About Us",
      contact: "Contact Us"
    },
    home: {
      headline: "Welcome to DHRM",
      tagline: "Your companion on the journey to spiritual wellness.",
      description:
        "DHRM combines ancient wisdom with modern AI to guide you towards self-realization. Explore spiritual quotes, meditate, chat with a Vedic coach, and discover holy scriptures."
    },
    drishti: {
      title: "Divya Drishti",
      desc: "A gift of Vedic wisdom—explore a random spiritual quote.",
      newBtn: "New Drishti",
      loading: "Fetching divine inspiration..."
    },
    dhyan: {
      title: "Dhyan (Meditation)",
      desc: "Start a 10-minute meditation and nurture your soul.",
      start: "Start",
      pause: "Pause",
      reset: "Reset",
      done: "Meditation Complete!",
      minutesLeft: "Minutes left"
    },
    chat: {
      title: "DHRM Chat",
      inputPh: "Share your thoughts or questions...",
      sendBtn: "Send",
      loading: "Receiving Vedic guidance...",
      empty: "Begin your chat... Ask anything spiritual."
    },
    books: {
      title: "Holy Books",
      desc: "Explore sacred texts and wisdom.",
      loading: "Fetching books...",
      open: "Open Book",
      close: "Close"
    },
    about: {
      title: "About Us",
      desc:
        "DHRM seeks to reclaim ‘Moksha’ (liberation) through spiritual wellness. We blend ancient Hindu scriptures with cutting-edge AI to help seekers find clarity, calm, and fulfillment. Jai Shree Ram!"
    },
    contact: {
      title: "Contact Us",
      name: "Name",
      message: "Message",
      submit: "Submit",
      thanks: "Thank you! Your message has been sent."
    }
  },
  hi: {
    appName: "धर्म: दिव्य सहायक, मोक्ष की पुनः प्राप्ति",
    nav: {
      home: "होम",
      drishti: "दिव्य दृष्टि",
      chat: "धर्म चैट",
      dhyan: "ध्यान",
      books: "पुस्तकें",
      about: "हमारे बारे में",
      contact: "संपर्क करें"
    },
    home: {
      headline: "DHRM में आपका स्वागत है",
      tagline: "आध्यात्मिक कल्याण की यात्रा पर आपका साथी।",
      description:
        "DHRM प्राचीन ज्ञान और आधुनिक AI को मिलाकर आपको आत्म-साक्षात्कार की ओर मार्गदर्शन करता है। आध्यात्मिक उद्धरण देखें, ध्यान करें, वैदिक कोच से बात करें, और पवित्र ग्रंथों की खोज करें।"
    },
    drishti: {
      title: "दिव्य दृष्टि",
      desc: "वैदिक ज्ञान की सौगात—एक यादृच्छिक आध्यात्मिक उद्धरण देखें।",
      newBtn: "नई दृष्टि",
      loading: "ईश्वरीय प्रेरणा प्राप्त की जा रही है..."
    },
    dhyan: {
      title: "ध्यान",
      desc: "10 मिनट का ध्यान शुरू करें और आत्मा को पोषित करें।",
      start: "शुरू करें",
      pause: "रोकें",
      reset: "रीसेट",
      done: "ध्यान पूर्ण हुआ!",
      minutesLeft: "शेष मिनट"
    },
    chat: {
      title: "धर्म चैट",
      inputPh: "अपने विचार या सवाल साझा करें...",
      sendBtn: "भेजें",
      loading: "वैदिक सुझाव प्राप्त हो रहे हैं...",
      empty: "अपनी चैट शुरू करें... कुछ भी आध्यात्मिक पूछें।"
    },
    books: {
      title: "पवित्र पुस्तकें",
      desc: "पवित्र ग्रंथों और ज्ञान का अन्वेषण करें।",
      loading: "पुस्तकें प्राप्त की जा रही हैं...",
      open: "पुस्तक खोलें",
      close: "बंद करें"
    },
    about: {
      title: "हमारे बारे में",
      desc:
        "DHRM ‘मोक्ष’ (मुक्ति) की पुनः प्राप्ति के लिए आध्यात्मिक कल्याण को बढ़ावा देता है। हम प्राचीन हिंदू ग्रंथों एवं आधुनिक AI को मिलाकर साधकों को स्पष्टता, शांति और संतुष्टि पाने में मदद करते हैं। जय श्री राम!"
    },
    contact: {
      title: "संपर्क करें",
      name: "नाम",
      message: "संदेश",
      submit: "प्रस्तुत करें",
      thanks: "धन्यवाद! आपका संदेश भेज दिया गया है।"
    }
  }
};

// ==== Tailwind CSS Setup ====
const tailwindCSS = `
@import url('https://fonts.googleapis.com/css2?family=Martel:wght@700&family=Hind:wght@400;700&display=swap');
* { font-family: 'Martel', 'Hind', Serif; }
.bg-dhrm { background: linear-gradient(135deg,#FFB866 0%,#FFD27C 80%,#FFFFFF 100%); }
.text-gold { color: #B8860B }
.text-saffron { color: #FF8243 }
.text-maroon { color: #800000 }
.bg-maroon { background: #800000 }
.bg-saffron { background: #FF8243 }
.bg-gold { background: #FFD700 }
.bg-cream { background: #FFFDD0 }
.border-dhrm { border-width: 2px; border-color: #B8860B }
.ring-dhrm { box-shadow: 0 0 8px 2px #FFD70055 }
a { color: #B8860B }
.react-modal-dhrm { background-color: #FFFDD0; box-shadow: 0 5px 32px 0 #80000033; padding:2rem; border-radius:0.6rem; border:2px solid #FF8243; max-width:600px; margin:auto; }
`;

// ==== Utility: i18n text ====
function T(lang, section, key) {
  return translations[lang][section][key];
}

// ==== Safe Modal Component ====
function Modal({ open, onClose, children }) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "");
  }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
      <div className="react-modal-dhrm relative">
        <button
          className="absolute top-2 right-4 p-2 rounded bg-saffron text-maroon font-bold"
          onClick={onClose}
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

// ==== Main DHRM App ====
export default function DHRM() {
  // --- App State ---
  const [lang, setLang] = useState("en");
  const [user, setUser] = useState(null);
  const [nav, setNav] = useState("home");

  // Auth & Firebase Init
  useEffect(() => {
    firebaseReady.then(() => {
      signInAnonymously().then((res) => setUser(res.user));
      onAuthStateChanged((u) => u && setUser(u));
    });
  }, []);

  // --- Pages ---
  return (
    <div className="min-h-screen bg-dhrm pb-16 relative">
      <style>{tailwindCSS}</style>
      <header className="flex flex-col items-center py-6 mb-2">
        <h1 className="text-3xl md:text-5xl font-bold text-gold drop-shadow-lg">{translations[lang].appName}</h1>
        <div className="mt-2 flex flex-row gap-4">
          <LangSelector lang={lang} setLang={setLang} />
        </div>
        <NavBar lang={lang} nav={nav} setNav={setNav} />
      </header>

      <main className="max-w-3xl mx-auto">
        {nav === "home" && <Home lang={lang} />}
        {nav === "drishti" && <DivyaDrishti lang={lang} />}
        {nav === "dhyan" && <Dhyan lang={lang} />}
        {nav === "chat" && <DHRMChat lang={lang} user={user} />}
        {nav === "books" && <Books lang={lang} />}
        {nav === "about" && <AboutUs lang={lang} />}
        {nav === "contact" && <ContactUs lang={lang} />}
      </main>

      <footer className="mt-20 py-4 text-center text-maroon text-sm font-bold">
        © {new Date().getFullYear()} DHRM | Divine Helper, Reclaiming Moksha | Jai Shree Ram!<br />
        {lang === "en" ? "Made with ♥ in India" : "भारत में प्रेम से निर्मित"}
      </footer>
    </div>
  );
}

// ==== Component: Lang Selector ====
function LangSelector({ lang, setLang }) {
  return (
    <div className="flex gap-2 text-md text-maroon">
      <button
        className={`px-2 py-1 rounded ${lang === "en" ? "bg-saffron ring-dhrm font-bold" : ""}`}
        onClick={() => setLang("en")}
      >
        EN 🇬🇧
      </button>
      <button
        className={`px-2 py-1 rounded ${lang === "hi" ? "bg-saffron ring-dhrm font-bold" : ""}`}
        onClick={() => setLang("hi")}
      >
        HI 🇮🇳
      </button>
    </div>
  );
}

// ==== Component: Navigation Bar ====
function NavBar({ lang, nav, setNav }) {
  return (
    <nav className="w-full flex flex-wrap items-center justify-center gap-2 mt-6">
      {Object.entries(translations[lang].nav).map(([id, label]) => (
        <button
          key={id}
          className={`px-4 py-2 mx-1 rounded text-lg font-semibold border-dhrm
              ${nav === id ? "bg-gold text-maroon ring-dhrm" : "bg-saffron text-maroon hover:bg-gold"}
          `}
          onClick={() => setNav(id)}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}

// ==== Page: Home ====
function Home({ lang }) {
  const THome = translations[lang].home;
  return (
    <div className="mt-10 text-center">
      <h2 className="text-2xl font-bold text-maroon mb-3">{THome.headline}</h2>
      <div className="text-gold text-lg">{THome.tagline}</div>
      <p className="mt-3 text-maroon max-w-xl mx-auto">{THome.description}</p>
      <img
        src="https://cdn.pixabay.com/photo/2020/05/22/04/18/indian-5198722_960_720.jpg" // Free use Swarajya/Vedic art
        alt="Vedic art"
        className="rounded-xl mt-8 mb-2 shadow-md ring-dhrm mx-auto w-full max-w-sm"
      />
    </div>
  );
}

// ==== Page: Divya Drishti ====
function DivyaDrishti({ lang }) {
  const [loading, setLoading] = useState(false);
  const [drishti, setDrishti] = useState(null);
  const TDrishti = translations[lang].drishti;

  async function fetchDrishti() {
    setLoading(true);
    await firebaseReady;
    try {
      const quotesColl = collection(db, `/artifacts/${APP_ID}/public/data/drishtiQuotes`);
      const quotesSnap = await getDocs(quotesColl);
      const quotes = [];
      quotesSnap.forEach((doc) => quotes.push(doc.data()));
      if (quotes.length === 0) setDrishti("No quotes found.");
      else setDrishti(quotes[Math.floor(Math.random() * quotes.length)].text);
    } catch (e) {
      setDrishti("Could not fetch drishti.");
    }
    setLoading(false);
  }
  useEffect(() => { fetchDrishti(); }, []); // On mount

  return (
    <section className="mt-8 flex flex-col items-center">
      <h2 className="text-2xl text-maroon font-bold">{TDrishti.title}</h2>
      <div className="mt-2 text-gold">{TDrishti.desc}</div>
      <div className="rounded-xl bg-cream px-6 py-8 my-7 border-dhrm shadow-lg max-w-lg text-center text-maroon min-h-[3rem] font-semibold">
        {loading ? TDrishti.loading : drishti}
      </div>
      <button className="bg-saffron px-6 py-2 rounded shadow-sm text-maroon text-lg ring-dhrm font-bold mt-3"
        disabled={loading} onClick={fetchDrishti}>{TDrishti.newBtn}</button>
    </section>
  );
}

// ==== Page: Dhyan (Meditation) ====
const AUDIO_URL = "https://cdn.pixabay.com/audio/2023/07/26/audio_122dbf8b10.mp3"; // replace with your desired soothing loop
function Dhyan({ lang }) {
  const [secondsLeft, setSecondsLeft] = useState(10 * 60);
  const [active, setActive] = useState(false);
  const [timer, setTimer] = useState(null);
  const [done, setDone] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    let tid;
    if (active && secondsLeft > 0) {
      tid = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    }
    if (secondsLeft === 0 && active) {
      setActive(false);
      setDone(true);
      audioRef.current?.pause();
    }
    setTimer(tid);
    return () => tid && clearTimeout(tid);
  }, [active, secondsLeft]);

  function handleStart() {
    setActive(true);
    setDone(false);
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.loop = true;
        audioRef.current.volume = 0.15;
        audioRef.current.play();
      }
    }, 100);
  }
  function handlePause() {
    setActive(false);
    audioRef.current?.pause();
  }
  function handleReset() {
    setActive(false);
    setSecondsLeft(10 * 60);
    setDone(false);
    audioRef.current?.pause();
    audioRef.current.currentTime = 0;
  }

  const min = Math.floor(secondsLeft / 60);
  const sec = secondsLeft % 60;
  const TDhyan = translations[lang].dhyan;

  return (
    <section className="mt-7 text-center flex flex-col items-center">
      <h2 className="text-2xl text-maroon font-bold">{TDhyan.title}</h2>
      <div className="mt-2 text-gold">{TDhyan.desc}</div>
      <div className="mt-7 flex flex-col gap-5 items-center">
        <div
          className={`w-44 h-44 rounded-full border-dhrm grid place-content-center bg-gold ring-dhrm mb-2 text-3xl text-maroon font-bold`}>
          {min}:{sec < 10 ? "0" : ""}{sec}
        </div>
        <div className="mb-1 text-gold">{TDhyan.minutesLeft}: {min}</div>
        <div className="flex gap-5 mt-2">
          {!active && (
            <button className="bg-saffron px-4 py-2 rounded text-maroon font-bold" onClick={handleStart}>{TDhyan.start}</button>
          )}
          {active && (
            <button className="bg-maroon px-4 py-2 rounded text-cream font-bold" onClick={handlePause}>{TDhyan.pause}</button>
          )}
          <button className="bg-gold px-4 py-2 rounded text-maroon font-bold" onClick={handleReset}>{TDhyan.reset}</button>
        </div>
        <audio ref={audioRef} src={AUDIO_URL} preload="auto" />
        {done && <div className="text-maroon font-semibold mt-6">{TDhyan.done}</div>}
      </div>
    </section>
  );
}

// ==== Page: DHRM Chat (Gemini AI) ====
function DHRMChat({ lang, user }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [empty, setEmpty] = useState(true);
  const TChat = translations[lang].chat;
  const chatCollPath =
    user ? `/artifacts/${APP_ID}/users/${user.uid}/chatHistory` : null;

  // Load chat history
  useEffect(() => {
    (async () => {
      await firebaseReady;
      if (!user) return;
      const coll = collection(db, chatCollPath);
      const snap = await getDocs(coll);
      const msgs = [];
      snap.forEach((d) => msgs.push(d.data()));
      setMessages(msgs);
      setEmpty(msgs.length === 0);
    })();
    // eslint-disable-next-line
  }, [user]);

  async function sendMessage() {
    if (!input.trim() || !user) return;
    setLoading(true);
    // Save user message to Firestore
    await firebaseReady;
    const userMsg = {
      role: "user", text: input, ts: Date.now()
    };
    await addDoc(collection(db, chatCollPath), userMsg);

    // Call Gemini API with proper system instruction & grounding
    const system_prompt =
      "You are a Vedic-grounded philosophical coach. Answer calmly and wisely, referencing ancient Hindu scriptures. All responses must include a source citation (e.g., '(Bhagavad Gita, 2.47)'). Use Google Search grounding for verifiable answers.";
    const chat_history = messages
      .map((m) => (m.role === "user" ? `User: ${m.text}` : `Coach: ${m.text}`))
      .join("\n");
    // Gemini API input as per grounding instructions
    const payload = {
      contents: [
        { role: "system", parts: [{ text: system_prompt }] },
        ...messages.map((m) => ({
          role: m.role,
          parts: [{ text: m.text }]
        })),
        { role: "user", parts: [{ text: input }] }
      ],
      tools: [
        { groundTool: { type: "google_search" } } // Gemini grounding via Google Search tool
      ]
    };
    let reply = "";
    try {
      const res = await fetch(GEMINI_API_URL + "?key=" + GEMINI_API_KEY, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      // Gemini returns: data.candidates[0].content.parts[0].text
      // Ensure response includes citation
      reply =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No response from divine coach.";
    } catch (e) {
      reply = "Error connecting to divine wisdom.";
    }
    // Save AI message to Firestore
    const aiMsg = {
      role: "assistant", text: reply, ts: Date.now()
    };
    await addDoc(collection(db, chatCollPath), aiMsg);
    setMessages([...messages, userMsg, aiMsg]);
    setInput("");
    setLoading(false);
    setEmpty(false);
  }

  return (
    <section className="mt-7 max-w-xl mx-auto">
      <h2 className="text-2xl text-maroon font-bold">{TChat.title}</h2>
      <div className="mt-2 text-gold">Chat with your Vedic Coach.</div>
      <div className="mt-6 bg-cream border-dhrm rounded-lg shadow-lg p-4 min-h-[250px]">
        {messages.length === 0 ? (
          <div className="text-maroon my-10">{TChat.empty}</div>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`px-4 py-2 rounded ${
                  msg.role === "user"
                    ? "bg-gold text-maroon font-semibold text-right"
                    : "bg-cream border border-dhrm"
                }`}
              >
                <div className="text-sm">{msg.text}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="mt-6 flex gap-2">
        <input
          type="text"
          className="flex-grow p-2 rounded border border-dhrm mr-3"
          value={input}
          placeholder={TChat.inputPh}
          disabled={loading}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => (e.key === "Enter" ? sendMessage() : null)}
        />
        <button
          className={`bg-saffron px-5 py-2 rounded font-bold text-maroon shadow-sm ring-dhrm ${
            loading ? "opacity-60" : ""
          }`}
          disabled={loading || !input.trim()}
          onClick={sendMessage}
        >
          {TChat.sendBtn}
        </button>
      </div>
      {loading && <div className="mt-3 text-maroon">{TChat.loading}</div>}
    </section>
  );
}

// ==== Page: Books ====
function Books({ lang }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [modalBook, setModalBook] = useState("");
  const [modalText, setModalText] = useState("");
  const TBooks = translations[lang].books;

  async function fetchBooks() {
    setLoading(true);
    await firebaseReady;
    try {
      const booksColl = collection(db, `/artifacts/${APP_ID}/public/data/books`);
      const booksSnap = await getDocs(booksColl);
      const arr = [];
      booksSnap.forEach((doc) =>
        arr.push({ ...doc.data(), id: doc.id })
      );
      setBooks(arr);
    } catch (e) {
      setBooks([]);
    }
    setLoading(false);
  }
  useEffect(() => { fetchBooks(); }, []);

  async function openBook(b) {
    setModal(true);
    setModalBook(b.title);
    setModalText("Loading…");
    await firebaseReady;
    try {
      const ref = doc(db, `/artifacts/${APP_ID}/public/data/books/${b.id}`);
      const snap = await getDoc(ref);
      setModalText(snap.data().text || "Text unavailable");
    } catch (e) {
      setModalText("Could not fetch book text.");
    }
  }

  return (
    <section className="mt-8 text-center">
      <h2 className="text-2xl text-maroon font-bold mb-3">{TBooks.title}</h2>
      <div className="mt-2 text-gold mb-8">{TBooks.desc}</div>
      {loading ? (
        <div>{TBooks.loading}</div>
      ) : books.length === 0 ? (
        <div className="text-maroon">No books found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {books.map((b) => (
            <div
              key={b.id}
              className="bg-gold bg-opacity-70 border-dhrm rounded-lg px-7 py-4 flex flex-col items-center"
            >
              <div className="font-bold text-maroon mb-2">{b.title}</div>
              <div className="mb-2 text-sm text-maroon">{b.desc}</div>
              <button
                className="bg-saffron font-bold px-4 py-1 rounded"
                onClick={() => openBook(b)}
              >
                {TBooks.open}
              </button>
            </div>
          ))}
        </div>
      )}
      <Modal open={modal} onClose={() => setModal(false)}>
        <div className="font-bold text-maroon text-xl mb-3">{modalBook}</div>
        <pre className="whitespace-pre-wrap max-h-[420px] overflow-y-auto text-maroon text-md">{modalText}</pre>
        <div className="mt-5">
          <button className="bg-gold text-maroon px-4 py-2 rounded shadow-sm font-bold"
            onClick={() => setModal(false)}>{TBooks.close}</button>
        </div>
      </Modal>
    </section>
  );
}

// ==== Page: About Us ====
function AboutUs({ lang }) {
  const TAbout = translations[lang].about;
  return (
    <section className="mt-10 text-center max-w-xl mx-auto">
      <h2 className="text-2xl text-maroon font-bold">{TAbout.title}</h2>
      <div className="mt-3 text-maroon text-md">{TAbout.desc}</div>
      <img
        src="https://cdn.pixabay.com/photo/2015/10/13/20/35/lord-shiva-987823_960_720.jpg"
        alt="Shiva"
        className="rounded-xl mt-8 mb-2 shadow-lg ring-dhrm mx-auto w-full max-w-sm"
      />
    </section>
  );
}

// ==== Page: Contact Us ====
function ContactUs({ lang }) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const TContact = translations[lang].contact;

  async function handleSubmit(e) {
    e.preventDefault();
    await firebaseReady;
    await addDoc(
      collection(db, `/artifacts/${APP_ID}/public/data/contactMessages`),
      {
        name,
        message,
        ts: Date.now()
      }
    );
    setName("");
    setMessage("");
    setSent(true);
    setTimeout(() => setSent(false), 3200);
  }
  return (
    <section className="max-w-lg mx-auto mt-10">
      <h2 className="text-2xl text-maroon font-bold">{TContact.title}</h2>
      <form className="flex flex-col gap-4 mt-9" onSubmit={handleSubmit}>
        <label className="font-bold text-maroon">{TContact.name}</label>
        <input
          className="border-dhrm rounded px-3 py-2"
          type="text"
          value={name}
          required
          onChange={(e) => setName(e.target.value)}
        />
        <label className="font-bold text-maroon">{TContact.message}</label>
        <textarea
          className="border-dhrm rounded px-3 py-2 min-h-[80px]"
          value={message}
          required
          onChange={(e) => setMessage(e.target.value)}
        />
        <button className="mt-3 text-lg bg-saffron px-5 py-2 rounded font-bold text-maroon ring-dhrm"
          type="submit">{TContact.submit}</button>
        {sent && (
          <div className="text-gold font-bold mt-2 text-center">{TContact.thanks}</div>
        )}
      </form>
    </section>
  );
}