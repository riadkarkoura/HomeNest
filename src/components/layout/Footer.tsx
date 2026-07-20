import Link from "next/link";

// Sprint 9.1 (Dead Links task): only real, existing destinations are
// listed here. Company/Support link groups (About Us, FAQ, Contact Us,
// etc.) were removed rather than pointed at href="#" or a placeholder
// page -- none of those pages exist yet. Re-add a group once its pages
// are actually built.
const footerLinks = {
  Shop: [
    { label: "All Products", href: "/products" },
    { label: "Kitchen", href: "/products?category=Kitchen" },
    { label: "Bathroom", href: "/products?category=Bathroom" },
    { label: "Storage", href: "/products?category=Storage" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <span className="text-xl font-semibold text-white">
              Home<span className="text-amber-500">Nest</span>
            </span>
            <p className="text-sm leading-relaxed">
              We help people solve everyday household problems with smart, affordable,
              and beautifully designed products. We don&apos;t sell products — we sell solutions.
            </p>
            <p className="text-xs text-stone-500">
              Free shipping on every order
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

        {/* Sprint 9.1: Privacy Policy / Terms of Service removed -- neither
            page exists yet (Dead Links task: remove, don't href="#"). */}
        <div className="mt-12 pt-8 border-t border-stone-800">
          <p className="text-xs text-stone-500">
            © {new Date().getFullYear()} HomeNest. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
