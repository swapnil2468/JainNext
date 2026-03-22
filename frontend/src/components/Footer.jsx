export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-neutral-900 via-rose-950 to-neutral-900 text-white pt-16 pb-8 px-6 lg:px-8">
      <div className="w-full px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="space-y-6">
            <span className="text-2xl font-light tracking-tight text-white">
              JAIN<span className="font-medium text-rose-400">NEXT</span>
            </span>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Premium lighting solutions designed to illuminate and elevate your space with timeless elegance.
            </p>
            <div className="flex gap-4">
              <a
                href="#facebook"
                className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full hover:bg-rose-600 transition-colors duration-200"
                aria-label="Facebook"
              >
                <i className="ri-facebook-fill"></i>
              </a>
              <a
                href="#instagram"
                className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full hover:bg-rose-600 transition-colors duration-200"
                aria-label="Instagram"
              >
                <i className="ri-instagram-line"></i>
              </a>
              <a
                href="#pinterest"
                className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full hover:bg-rose-600 transition-colors duration-200"
                aria-label="Pinterest"
              >
                <i className="ri-pinterest-fill"></i>
              </a>
              <a
                href="#twitter"
                className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full hover:bg-rose-600 transition-colors duration-200"
                aria-label="Twitter"
              >
                <i className="ri-twitter-x-line"></i>
              </a>
            </div>
          </div>
          {/* Shop Column */}
          <div>
            <h4 className="font-medium text-white mb-6">Shop</h4>
            <ul className="space-y-3">
              <li>
                <a href="#new-arrivals" className="text-neutral-400 hover:text-rose-400 transition-colors duration-200 text-sm">
                  New Arrivals
                </a>
              </li>
              <li>
                <a href="#bestsellers" className="text-neutral-400 hover:text-rose-400 transition-colors duration-200 text-sm">
                  Bestsellers
                </a>
              </li>
              <li>
                <a href="#sale" className="text-neutral-400 hover:text-rose-400 transition-colors duration-200 text-sm">
                  Sale
                </a>
              </li>
              <li>
                <a href="#collections" className="text-neutral-400 hover:text-rose-400 transition-colors duration-200 text-sm">
                  Collections
                </a>
              </li>
              <li>
                <a href="#gift-cards" className="text-neutral-400 hover:text-rose-400 transition-colors duration-200 text-sm">
                  Gift Cards
                </a>
              </li>
            </ul>
          </div>
          {/* Support Column */}
          <div>
            <h4 className="font-medium text-white mb-6">Support</h4>
            <ul className="space-y-3">
              <li>
                <a href="#contact" className="text-neutral-400 hover:text-rose-400 transition-colors duration-200 text-sm">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#faq" className="text-neutral-400 hover:text-rose-400 transition-colors duration-200 text-sm">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#shipping" className="text-neutral-400 hover:text-rose-400 transition-colors duration-200 text-sm">
                  Shipping & Returns
                </a>
              </li>
              <li>
                <a href="#warranty" className="text-neutral-400 hover:text-rose-400 transition-colors duration-200 text-sm">
                  Warranty
                </a>
              </li>
              <li>
                <a href="#installation" className="text-neutral-400 hover:text-rose-400 transition-colors duration-200 text-sm">
                  Installation Guide
                </a>
              </li>
            </ul>
          </div>
          {/* Newsletter Column */}
          <div>
            <h4 className="font-medium text-white mb-6">Stay Connected</h4>
            <p className="text-neutral-400 text-sm mb-4">
              Subscribe to receive updates, access to exclusive deals, and design inspiration.
            </p>
            <form className="space-y-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-white border-2 border-white rounded-xl text-neutral-900 placeholder-neutral-400 text-sm font-medium focus:outline-none focus:border-rose-200 focus:ring-2 focus:ring-white/50 transition-all duration-200"
              />
              <button
                type="submit"
                className="w-full px-6 py-3 bg-gradient-to-r from-rose-600 to-rose-700 text-white text-sm font-medium rounded-full hover:from-rose-700 hover:to-rose-800 transition-colors duration-200 whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-neutral-500 text-sm">
              © 2026 Jainnext. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#privacy" className="text-neutral-500 hover:text-rose-400 transition-colors duration-200 text-sm">
                Privacy Policy
              </a>
              <a href="#terms" className="text-neutral-500 hover:text-rose-400 transition-colors duration-200 text-sm">
                Terms of Service
              </a>
              <a href="#accessibility" className="text-neutral-500 hover:text-rose-400 transition-colors duration-200 text-sm">
                Accessibility
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}