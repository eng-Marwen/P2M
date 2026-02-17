import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaEnvelope, FaMapMarkerAlt, FaPhone } from "react-icons/fa";
import { showToast } from "../popups/tostHelper";

//TODO: connect this form to backend (not implemented yet)

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const ContactUs = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactForm>({
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const [loading, setLoading] = useState<boolean>(false);

  const onSubmit = async (data: ContactForm) => {
    setLoading(true);
    // TODO: connect this form to backend (not implemented yet)
    showToast("Message sent — we'll reply soon!", "success");
    reset();
    setLoading(false);
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
                  Sup'Com, Technopole Gazella, Avenue Raoued, Ariana, Tunisia
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 hidden lg:block">
            <iframe
              title="office-map"
              src="https://www.google.com/maps?q=Sup'Com+Technopole+Gazella+Avenue+Raoued+Ariana+Tunisia&t=&z=15&ie=UTF8&iwloc=&output=embed"
              className="w-full h-40 rounded-lg border"
            />
          </div>
        </section>

        <section className="bg-white rounded-2xl p-6 shadow">
          <h2 className="text-xl font-semibold text-slate-900 mb-3">
            Send us a message
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <input
                  {...register("name", {
                    required: "Name is required",
                    minLength: {
                      value: 2,
                      message: "Name must be at least 2 characters",
                    },
                  })}
                  placeholder="Your name"
                  className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-rose-50 ${
                    errors.name ? "border-red-500" : "border-gray-200"
                  }`}
                  aria-label="Name"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <input
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                  placeholder="Email address"
                  className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-rose-50 ${
                    errors.email ? "border-red-500" : "border-gray-200"
                  }`}
                  aria-label="Email"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <input
              {...register("subject")}
              placeholder="Subject (optional)"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-rose-50"
              aria-label="Subject"
            />

            <div>
              <textarea
                {...register("message", {
                  required: "Message is required",
                  minLength: {
                    value: 10,
                    message: "Message must be at least 10 characters",
                  },
                })}
                placeholder="Your message"
                rows={6}
                className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-rose-50 ${
                  errors.message ? "border-red-500" : "border-gray-200"
                }`}
                aria-label="Message"
              />
              {errors.message && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.message.message}
                </p>
              )}
            </div>

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
    </main>
  );
};

export default ContactUs;
