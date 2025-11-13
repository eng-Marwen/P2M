import {
  FaBullseye,
  FaMapMarkerAlt,
  FaShieldAlt,
  FaUsers,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const Stat = ({ value, label }) => (
  <div className="flex flex-col items-center">
    <div className="text-3xl md:text-4xl font-extrabold text-slate-900">
      {value}
    </div>
    <div className="text-sm text-slate-500 mt-1">{label}</div>
  </div>
);

const TeamCard = ({ person }) => (
  <article className="bg-white rounded-xl shadow-sm hover:shadow-md p-4 flex gap-4 items-center">
    <img
      src={person.avatar}
      alt={person.name}
      className="w-16 h-16 rounded-full object-cover border"
    />
    <div>
      <div className="font-semibold text-slate-800">{person.name}</div>
      <div className="text-sm text-slate-500">{person.role}</div>
    </div>
  </article>
);

const About = () => {

  return (
    <main className="min-h-screen bg-linear-to-b from-slate-50 via-white to-slate-50 px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Hero */}
        <section className="grid gap-8 lg:grid-cols-2 items-center mb-12">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight">
              Built for people who want to find — and list — great homes
            </h1>
            <p className="mt-4 text-lg text-slate-600 max-w-xl">
              Samsar ProMax is a modern marketplace connecting owners, agents
              and renters with a simple, beautiful and secure experience — from
              first search to moving day.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                to="/create-house"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-black text-white font-semibold shadow hover:opacity-95"
              >
                List a property
              </Link>
              <Link
                to="/search"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-gray-200 text-slate-700 hover:bg-gray-50"
              >
                Search listings
              </Link>
            </div>
          </div>

          <div className="order-first lg:order-last">
            <div className="rounded-2xl overflow-hidden shadow-lg bg-white">
              <img
                src="https://github.com/eng-Marwen/images/blob/main/bigLogo-removebg.png?raw=true"
                alt="About hero"
                className="w-full h-64 sm:h-72 object-cover"
              />
            </div>
          </div>
        </section>

        {/* Why */}
        <section className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-md bg-indigo-50 text-indigo-600">
              <FaBullseye />
            </div>
            <h3 className="mt-4 font-semibold text-slate-800">Our mission</h3>
            <p className="mt-2 text-sm text-slate-500">
              Make finding and listing properties fast, reliable and delightful
              for everyone.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-md bg-rose-50 text-rose-600">
              <FaUsers />
            </div>
            <h3 className="mt-4 font-semibold text-slate-800">
              Community first
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              We build tools for real people — tenants, owners and agents — to
              transact with confidence.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-md bg-sky-50 text-sky-600">
              <FaShieldAlt />
            </div>
            <h3 className="mt-4 font-semibold text-slate-800">
              Secure & trusted
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Verified listings, clear pricing and privacy-first design keep
              your info safe.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="mb-12 bg-white p-6 rounded-xl shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Stat value="1k+" label="Listings" />
            <Stat value="98%" label="Satisfied users" />
            <Stat value="24/7" label="Support" />
            <Stat
              value={
                <span className="flex items-center gap-2">
                  <FaMapMarkerAlt />
                  10+
                </span>
              }
              label="Cities"
            />
          </div>
        </section>


        {/* CTA */}
        <section className="mb-12 rounded-xl bg-linear-to-r from-slate-900 to-black text-white p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold">
              Ready to reach more renters & buyers?
            </h3>
            <p className="text-sm text-slate-200 mt-1">
              List your property in minutes and grow your audience.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/create-house"
              className="inline-flex items-center gap-2 px-5 py-3 bg-white text-slate-900 rounded-lg font-semibold"
            >
              List a property
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-5 py-3 border border-white/20 text-white rounded-lg"
            >
              Contact us
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
};

export default About;
