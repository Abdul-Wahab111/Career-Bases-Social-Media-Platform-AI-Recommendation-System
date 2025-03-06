import { User2, ArrowLeft } from "lucide-react"
import Layout from "../../components/Layout"

const NotFoundState = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
          <User2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">User Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400">
            The user you're looking for doesn't exist or you don't have permission to view this profile.
          </p>
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

export default NotFoundState

