import { FaCode } from 'react-icons/fa';
import Head from 'next/head';
import { JSXElementConstructor, Key, PromiseLikeOfReactNode, ReactElement, ReactNode, ReactPortal, useState } from 'react';
import Layout from '@/components/layout';
import toast from 'react-hot-toast'
import {
  contractQuery,
  decodeOutput,
  useInkathon,
  useRegisteredContract,
} from '@scio-labs/use-inkathon'
import { ContractIds } from '@/deployments/deployments'
import { Option } from '@polkadot/types';
import { border } from '@chakra-ui/react';


export default function SearchJobPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryQuery, setCategoryQuery] = useState('');
  const { api, activeAccount, activeSigner } = useInkathon()
  const [fetchIsLoading, setFetchIsLoading] = useState<boolean>();
  const { contract, address: contractAddress } = useRegisteredContract(ContractIds.Freelankakot)
  const [searchJobsResult, setSearchJobsResult] = useState<any[]>([]);
  const handleSearch = (event: { preventDefault: () => void; }) => {
    event.preventDefault();
    console.log('Search query:', searchQuery);
  };

  const searchJobs = async (searchQuery: string, categoryQuery: string) => {
    if (!contract || !api) return;
    setFetchIsLoading(true);
    try {
      const result = await contractQuery(api, '', contract, 'get_all_open_jobs', {}, [searchQuery, categoryQuery]);
      const { output, isError, decodedOutput } = decodeOutput(result, contract, 'get_all_open_jobs');
      if (isError) throw new Error(decodedOutput);
      setSearchJobsResult(output);
    } catch (e) {
      console.error(e);
      toast.error('Error while fetching greeting. Try again...');
      setSearchJobsResult([]);
    } finally {
      setFetchIsLoading(false);
    }
  };

  const json = JSON.stringify(searchJobsResult, null, 2);
  const list_jobs = JSON.parse(json);
  const data = list_jobs.Ok;
  

  return (
    <Layout>
      <Head>
        <title>Search Job Page</title>
      </Head>

      <section className="py-10">
        <div className="bg-white rounded-lg shadow p-6 mx-auto max-w-3xl">

          <h1 className="text-3xl text-gray-800 font-bold mb-6" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '2px', color: 'blue' }}>
            <FaCode className="inline-block align-middle text-blue-500 mr-2" /> Find Jobs
          </h1>
          <form onSubmit={handleSearch} className="flex items-center">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-gray-400 rounded py-2 px-4 mr-2"
              style={{ width: '250px' }}
            />
            <select
              value={categoryQuery}
              onChange={(e) => setCategoryQuery(e.target.value)}
              className="border border-gray-400 rounded py-2 px-4 mr-2"
              style={{ width: '150px' }}
            >
              <option value="">NONE</option>
              <option value="IT">IT</option>
              <option value="PHOTOSHOP">PHOTOSHOP</option>
              <option value="MARKETING">MARKETING</option>
            </select>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Search
            </button>
          </form>

          {fetchIsLoading && <p style={{ color: 'red' }}>Loading...</p>}

          {data && data.length > 0 ? (
            <table style={{ textAlign: 'center', border: '1px solid black' }}>
              <thead>
                <tr>
                  <th style={{ backgroundColor: 'yellow' }}>Job Name</th>
                  <th style={{ backgroundColor: 'pink' }}>Description</th>
                  <th style={{ backgroundColor: 'orange' }}>Category</th>
                  <th style={{ backgroundColor: 'lightblue' }}>Pay</th>
                  <th style={{ backgroundColor: 'lightgreen' }}>End Time</th>
                  <th style={{ backgroundColor: 'lightgray' }}>Status</th>
                </tr>
              </thead>

              <tbody>
                {data.map((item: { id: string, name: string, description: string, category: string, pay: string, endTime: string, status: string, personCreate: string }) => (
                  <tr key={item.id}>
                    <td style={{ color: 'red' }}>{item.name}</td>
                    <td style={{ color: 'blue' }}>{item.description}</td>
                    <td style={{ color: 'green' }}>{item.category}</td>
                    <td style={{ color: 'purple' }}>{item.pay}</td>
                    <td style={{ color: 'yellow' }}>{item.endTime}</td>
                    <td style={{ color: 'pink' }}>{item.status}</td>
                    <td>
                      <button className="button" style={{ backgroundColor: 'orange' }}>Detail</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: 'gray' }}>No data available.</p>
          )}
        </div>
      </section>
    </Layout>
  );
}
