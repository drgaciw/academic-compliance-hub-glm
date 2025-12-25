import { StreamingSearch } from "../../components/search";

export const revalidate = 3600;

export default function DocsSearchPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Documentation
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Search our documentation with AI-powered answers
          </p>
        </div>

        <StreamingSearch />
      </div>
    </div>
  );
}
