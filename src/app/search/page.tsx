import CSE from '@/components/CSE'
import { SimpleLayout } from '@/components/SimpleLayout'

const Page = async () => {
  return (
    <SimpleLayout seachBox={true}>
      <div className="relative bg-gray-100 px-6 py-16 lg:px-8">
        <CSE type="searchresults" />
      </div>
    </SimpleLayout>
  )
}

export default Page
