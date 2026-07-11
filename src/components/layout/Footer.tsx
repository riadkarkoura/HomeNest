import Link from "next/link";

const footerLinks = {
  Shop: [
    { label: "All Products", href: "/products" },
    { label: "Living Room", href: "/products?category=Living+Room" },
    { label: "Bedroom", href: "/products?category=Bedroom" },
    { label: "Office", href: "/products?category=Office" },
  ],
  Company: [
    { label: "About Us", href: "#" },
    { label: "Sustainability", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Press", href: "#" },
  ],
  Support: [
    { label: "FAQ", href: "#" },
    { label: "Shipping & Returns", href: "#" },
    { label: "Care Guide", href: "#" },
    { label: "Contact Us", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <span className="text-xl font-semibold text-white">
              Home<span className="text-amber-500">Nest</span>
            </span>
            <p className="text-sm leading-relaxed">
              Curated furniture and home accessories for a life well lived. Crafted with intention,
              built to last.
            </p>
            <p className="text-xs text-stone-500">
              Free shipping on orders over $500
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                {title}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm hover:text-amber-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-stone-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-stone-500">
            © {new Date().getFullYear()} HomeNest. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs">
            <Link href="#" className="hover:text-amber-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-amber-400 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
