import Head from 'next/head';
import { useState } from 'react';
import Layout from '@/components/layout';

export default function CreateJobPage() {
  const [jobTitle, setJobTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    // TODO: Send the job details to your backend server and handle job creation and marketplace integration.
    console.log('Job details:', { jobTitle, description, budget });
  };

  return (
    <Layout>
      <Head>
        <title>Create Job Page</title>
      </Head>

      <section className="text-center py-10">
        <h1 className="text-2xl">Create Job Page</h1>
        <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-5">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="jobTitle">
              Job Title
            </label>
            <input
              type="text"
              id="jobTitle"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="budget">
              Budget
            </label>
            <input
              type="text"
              id="budget"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Create Job
          </button>
        </form>
      </section>
    </Layout>
  );
}