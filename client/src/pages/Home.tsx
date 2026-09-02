import { Link } from 'react-router-dom';
import { ArrowRight, BarChart2, Shield, Zap, Globe } from 'lucide-react';
import { UrlShortener } from '../components/UrlShortener.js';
import { cn } from '../lib/utils.js';

const features = [
  {
    icon: Zap,
    title: 'Fast & Reliable',
    description: 'Powered by Fastify and Redis caching for sub-millisecond redirects.',
  },
  {
    icon: Shield,
    title: 'Secure by Default',
    description: 'Input validation, rate limiting, and no tracking of personal data.',
  },
  {
    icon: Globe,
    title: 'Globally Scalable',
    description: 'ZooKeeper coordination ensures unique codes across distributed instances.',
  },
  {
    icon: BarChart2,
    title: 'Built-in Analytics',
    description: 'Track clicks, referrers, and geographic data without compromising privacy.',
  },
];

export function Home() {
  return (
    <div className="space-y-16">
      <section className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white tracking-tight mb-6">
          Short URLs, <span className="text-blue-600 dark:text-blue-400">Long Impact</span>
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Create clean, memorable short links with built-in analytics, expiration control,
          and enterprise-grade reliability.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/urls" className="btn-primary w-full sm:w-auto">
            Get Started
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link to="/urls" className="btn-secondary w-full sm:w-auto">
            View Dashboard
          </Link>
        </div>
      </section>

      <UrlShortener />

      <section aria-labelledby="features-heading" className="border-t border-gray-200 dark:border-gray-700 pt-16">
        <h2 id="features-heading" className="text-2xl font-semibold text-gray-900 dark:text-white text-center mb-12">
          Why Choose This Shortener?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <article key={feature.title} className="card p-6 hover:shadow-md transition-shadow">
              <div className={cn('p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-4 w-fit')}>
                <feature.icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="cta-heading" className="bg-blue-600 dark:bg-blue-700 rounded-2xl p-8 sm:p-12 text-center text-white">
        <h2 id="cta-heading" className="text-2xl sm:text-3xl font-bold mb-4">Ready to shorten your links?</h2>
        <p className="text-blue-100 mb-6 max-w-xl mx-auto">
          Join developers building scalable applications. Start creating short URLs in seconds.
        </p>
        <Link to="/urls" className="inline-flex items-center gap-2 bg-white text-blue-600 font-medium px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors">
          Create Your First Link
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}