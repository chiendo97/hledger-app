import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

const Navigation = () => {
  return (
    <nav className="bg-background border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between">
          <div className="flex space-x-7">
            <div>
              <Link href="/" className="flex items-center py-4 px-2">
                <span className="font-semibold text-foreground text-lg">
                  Financial Tracker
                </span>
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-1">
              <Link
                href="/balance-sheet"
                className="py-4 px-2 text-foreground font-semibold hover:text-primary transition duration-300"
              >
                Balance Sheet
              </Link>
              <Link
                href="/income-statement"
                className="py-4 px-2 text-foreground font-semibold hover:text-primary transition duration-300"
              >
                Income Statement
              </Link>
              <Link
                href="/transactions"
                className="py-4 px-2 text-foreground font-semibold hover:text-primary transition duration-300"
              >
                Transactions
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
