import { FaCode } from 'react-icons/fa';
import Head from 'next/head';
import { useState } from 'react';
import Layout from '@/components/layout';

export default function SearchJobPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (event: { preventDefault: () => void; }) => {
    event.preventDefault();
    // TODO: Perform search based on the searchQuery value
    console.log('Search query:', searchQuery);
  };

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
          <form onSubmit={handleSearch} className="flex items-center">
            <input
              type="text"
              className="border border-gray-300 rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:border-blue-500 flex-grow"
              placeholder="Enter job search keywords"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded ml-4 focus:outline-none focus:ring focus:border-blue-300"
            >
              Search
            </button>
          </form>
          {/* Your search job results can be added here */}
        </div>
      </section>
    </Layout>
  );
}