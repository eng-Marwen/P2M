import { useState } from "react";
import { FaEnvelope, FaMapMarkerAlt, FaPhone } from "react-icons/fa";
import { ToastContainer } from "react-toastify";
import { showToast } from "../popups/tostHelper.js";

//TODO: connect this form to backend (not implemented yet)

const ContactUs = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((s) => ({ ...s, [e.target.id]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      showToast("Please fill name, email and message.", "error");
      return;
    }
    setLoading(true);
          showToast("Message sent — we'll reply soon!", "success");
      setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <main className="min-h-screen bg-linear-to-b from-slate-50 via-white to-slate-50 px-4 py-12">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-white rounded-2xl p-6 shadow">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Contact us</h1>
          <p className="text-sm text-slate-600 mb-6">
            Have a question or need help? Send us a message and we'll get back
            to you shortly.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-indigo-50 text-indigo-600">
                <FaEnvelope />
              </span>
              <div>
                <div className="font-semibold text-slate-800">Email</div>
                <div className="text-sm text-slate-500">support@samsar.com</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-rose-50 text-rose-600">
                <FaPhone />
              </span>
              <div>
                <div className="font-semibold text-slate-800">Phone</div>
                <div className="text-sm text-slate-500">+216 25 464 580</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-sky-50 text-sky-600">
                <FaMapMarkerAlt />
              </span>
              <div>
                <div className="font-semibold text-slate-800">Office</div>
                <div className="text-sm text-slate-500">
                  Sup'Com Ariana, Raoued, Tunisia
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 hidden lg:block">
            <iframe
              title="office-map"
              src="https://www.google.com/maps?q=ariana%20raoued&t=&z=13&ie=UTF8&iwloc=&output=embed"
              className="w-full h-40 rounded-lg border"
            />
          </div>
        </section>

        <section className="bg-white rounded-2xl p-6 shadow">
          <h2 className="text-xl font-semibold text-slate-900 mb-3">
            Send us a message
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                id="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
                className="px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-rose-50"
                aria-label="Name"
                required
              />
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email address"
                className="px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-rose-50"
                aria-label="Email"
                required
              />
            </div>

            <input
              id="subject"
              value={form.subject}
              onChange={handleChange}
              placeholder="Subject (optional)"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-rose-50"
              aria-label="Subject"
            />

            <textarea
              id="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Your message"
              rows={6}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-rose-50"
              aria-label="Message"
              required
            />

            <div className="flex items-center justify-between gap-4">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg font-semibold hover:opacity-95 disabled:opacity-60"
              >
                {loading ? "Sending..." : "Send message"}
              </button>

              <div className="text-sm text-slate-500">
                We reply within 24–48 hours.
              </div>
            </div>
          </form>
        </section>
      </div>

      <ToastContainer />
    </main>
  );
};

export default ContactUs;
