import Head from 'next/head';
import { useState } from 'react';
import Layout from '@/components/layout';

export default function CreateJobPage() {
  const [jobTitle, setJobTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');

  const handleSubmit = (event: { preventDefault: () => void; }) => {
    event.preventDefault();
    // TODO: Send the job details to your backend server and handle job creation and marketplace integration.
    console.log('Job details:', { jobTitle, description, budget });
  };

  return (
    <Layout>
      <Head>
        <title>Create Job Page</title>
      </Head>

      <section className="py-10">
        <div className="bg-white rounded-lg shadow p-6 mx-auto max-w-3xl">
          <h1 className="text-3xl text-gray-800 font-bold mb-6">Create a Job</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-gray-700 font-semibold mb-2" htmlFor="jobTitle">
                Job Title
              </label>
              <input
                type="text"
                id="jobTitle"
                className="border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:border-blue-500"
                placeholder="Enter the job title"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-gray-700 font-semibold mb-2" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                className="border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:border-blue-500"
                placeholder="Enter the job description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-gray-700 font-semibold mb-2" htmlFor="budget">
                Budget
              </label>
              <input
                type="text"
                id="budget"
                className="border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:border-blue-500"
                placeholder="Enter the budget"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded focus:outline-none focus:ring focus:border-blue-300"
            >
              Post Job
            </button>
          </form>
        </div>
      </section>
    </Layout>
  );
}