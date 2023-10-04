import { FaCode } from 'react-icons/fa';
import Head from 'next/head';
import Layout from '@/components/layout';

export default function SearchJobPage() {
  return (
    <Layout>
      <Head>
        <title>Search Job Page</title>
      </Head>

      <section className="text-center py-10">
        <h1 className="text-2xl">
          <FaCode className="inline-block mr-2" /> Search Job Page
        </h1>
        {/* Your search job form and results can be added here */}
      </section>
    </Layout>
  );
}