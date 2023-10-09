import React, { useState, useEffect } from 'react';
import { BiTask } from 'react-icons/bi';
import Head from 'next/head';
import Layout from '@/components/layout';
import { contractQuery, decodeOutput, useInkathon, useRegisteredContract } from '@scio-labs/use-inkathon';
import { ContractIds } from '@/deployments/deployments';

export default function JobManagementPage() {
    const [jobProcessingInfo, setJobProcessingInfo] = useState([]);
    const [fetchIsLoading, setFetchIsLoading] = useState<boolean>();
    const [isFreelancer, setIsFreelancer] = useState<boolean>();
    const { contract } = useRegisteredContract(ContractIds.Freelankakot);
    const { api, activeAccount, activeSigner } = useInkathon();
    const [updateIsLoading, setUpdateIsLoading] = useState<boolean>();

    const checkFreelancer = async () => {
        if (!activeAccount || !contract || !activeSigner || !api) {
            return;
        }
        else {
            setUpdateIsLoading(true);
            try {
                const result = await contractQuery(api, activeAccount.address, contract, 'check_caller_is_freelancer', {}, []);
                const { output } = decodeOutput(result, contract, 'check_caller_is_freelancer');
                console.log(output)
                setIsFreelancer(output);
            } catch (e) {
                console.error(e);
            } finally {
                setUpdateIsLoading(false);
            }
        }
    };

    const checkJobProccessing = async () => {
        if (!activeAccount || !contract || !activeSigner || !api) {
            return;
        }
        else {
            setUpdateIsLoading(true);
            try {
                const result = await (isFreelancer ? contractQuery(api, activeAccount.address, contract, 'get_all_doning_jobs_of_freelancer', {}, []) : contractQuery(api, '', contract, 'get_all_review_jobs_of_owner', {}, []));
                const { output } = (isFreelancer ? decodeOutput(result, contract, 'get_all_doning_jobs_of_freelancer') : decodeOutput(result, contract, 'get_all_review_jobs_of_owner'));
                setJobProcessingInfo(output);
            } catch (e) {
                console.error(e);
            } finally {
                setUpdateIsLoading(false);
            }
        }
    }

    const json = JSON.stringify(jobProcessingInfo, null, 2);
    const list_jobs = JSON.parse(json);
    const data = list_jobs.Ok;



    useEffect(() => {
        checkFreelancer();
    }, [contract]);

    return (
        <Layout>
            <Head>
                <title>Job Management Page</title>
            </Head>
            <section className="py-10">
                <div className="bg-white rounded-lg shadow p-6 mx-auto max-w-3xl">
                    <h1 className="text-3xl text-gray-800 font-bold mb-6" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '2px', color: 'blue' }}>
                        <BiTask className="inline-block align-middle text-blue-500 mr-2" /> Job Management
                    </h1>
                    <form className="flex items-center"></form>

                    {fetchIsLoading && <p style={{ color: 'red' }}>Loading...</p>}

                    {data && data.length > 0 ? (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th style={{ backgroundColor: 'yellow' }}>Job Name</th>
                                    <th style={{ backgroundColor: 'pink' }}>Description</th>
                                    <th style={{ backgroundColor: 'orange' }}>Category</th>
                                    <th style={{ backgroundColor: 'lightblue' }}>Pay</th>
                                    <th style={{ backgroundColor: 'lightgreen' }}>End Time</th>
                                    <th style={{ backgroundColor: 'lightgray' }}>Status</th>
                                    <th></th> {/* Add an empty column for the header */}
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
    )
}