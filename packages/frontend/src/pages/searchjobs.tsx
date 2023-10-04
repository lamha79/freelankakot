import { FaCode } from 'react-icons/fa';
import Head from 'next/head';
import Layout from '@/components/layout';

export default function SearchJobPage() {
  return (
    <Layout>
      <Head>
        <title>Search Job Page</title>
      </Head>

      <section className="py-10">
        <div className="bg-white rounded-lg shadow p-6 mx-auto max-w-3xl">
          <h1 className="text-3xl text-gray-800 font-bold mb-6">
            <FaCode className="inline-block align-middle text-blue-500 mr-2" /> Find Jobs
          </h1>
          {/* Your search job form and results can be added here */}
        </div>
      </section>
    </Layout>
  );
}