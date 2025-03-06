import { AlertCircle, ArrowLeft } from "lucide-react"
import Layout from "../../components/Layout"

const ErrorState = ({ error }) => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Error Loading Profile</h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
          <a
            href="/profiles"
            className="mt-4 inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Profiles
          </a>
        </div>
      </div>
    </Layout>
  )
}

export default ErrorState

