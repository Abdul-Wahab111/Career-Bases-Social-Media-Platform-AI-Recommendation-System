import { Loader2 } from "lucide-react"
import Layout from "../../components/Layout"

const LoadingState = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg">Loading user profile...</p>
        </div>
      </div>
    </Layout>
  )
}

export default LoadingState

