import React, { useState, useEffect } from 'react';
import { BiTask } from 'react-icons/bi';
import Head from 'next/head';
import Layout from '@/components/layout';
import { contractQuery, decodeOutput, useInkathon, useRegisteredContract } from '@scio-labs/use-inkathon';
import { ContractIds } from '@/deployments/deployments';
import { Button } from 'flowbite-react';
import { contractTxWithToast } from '@/utils/contractTxWithToast';
import toast from 'react-hot-toast'


export default function JobManagementPage() {
    const [jobProcessingInfo, setJobProcessingInfo] = useState([]);
    const [fetchIsLoading, setFetchIsLoading] = useState<boolean>();
    const [isFreelancer, setIsFreelancer] = useState<boolean>();
    const { contract } = useRegisteredContract(ContractIds.Freelankakot);
    const { api, activeAccount, activeSigner } = useInkathon();
    const [updateIsLoading, setUpdateIsLoading] = useState<boolean>(false);
    // Thêm vào
    
    const sumitJobs = async (job_id: number, result: string) => {
        if (!activeAccount || !contract || !activeSigner || !api) {
          toast.error('Wallet not connected. Try again…')
          return
        }
        setUpdateIsLoading(true)
        try {
          if (isFreelancer) {
            await contractTxWithToast(api, activeAccount.address, contract, 'submit', {}, [
                job_id, result
              ])
          } else {
            await contractTxWithToast(api, activeAccount.address, contract, 'aproval', {}, [
                job_id
              ])
          }
        } catch (e) {
          console.error(e)
        } finally {
        setUpdateIsLoading(false)
        checkJobProccessing()
        }
      }

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
                const result = await (isFreelancer ? contractQuery(api, activeAccount.address, contract, 'get_all_doning_jobs_of_freelancer', {}, []) : contractQuery(api, activeAccount.address, contract, 'get_all_review_jobs_of_owner', {}, []));
                const { output } = (isFreelancer ? decodeOutput(result, contract, 'get_all_doning_jobs_of_freelancer') : decodeOutput(result, contract, 'get_all_review_jobs_of_owner'));
                setJobProcessingInfo(output);
                console.log(output)
            } catch (e) {
                console.error(e);
            } finally {
                setUpdateIsLoading(false);
            }
        }
    }

    //thêm vào 

        const [resultToSumit, setResultSumit] = useState('');

        const sumit = (jobId: number, result: any) => {
            if (isFreelancer) {
                const prompValue = prompt('Submit your result');
                if(prompValue === null) {
                    alert("please sumit your result")
                }
                else {
                    setResultSumit(prompValue);
                    sumitJobs(jobId, prompValue);
                }
            } else {
                // alert("result: " + result)
                const prompValue = prompt('Result of this job: \"' + result + "\". Do you want to approve? (yes/no)");
                if(prompValue === null) {
                    alert("please sumit your result")
                } else if (prompValue.toLocaleLowerCase() != "no") {
                    setResultSumit(prompValue);
                    sumitJobs(jobId, prompValue);
                }
            }
        }
    ////

    const json = JSON.stringify(jobProcessingInfo, null, 2);
    const list_jobs = JSON.parse(json);
    const data = list_jobs.Ok;



    useEffect(() => {
        checkFreelancer();
        checkJobProccessing();
    }, [contract, activeAccount, activeSigner, api]);

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

                    {isFreelancer && <Button onClick={(e) => checkJobProccessing()}>All doing jobs</Button>}    
                    {!isFreelancer && <Button onClick={(e) => checkJobProccessing()}>All review jobs</Button>}

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
                                {data.map((item: { jobId: number, name: string, description: string, category: string, pay: string, endTime: string, status: string, personCreate: string, result: String }) => (
                                    <tr key={item.jobId}>
                                        <td style={{ color: 'red' }}>{item.name}</td>
                                        <td style={{ color: 'blue' }}>{item.description}</td>
                                        <td style={{ color: 'green' }}>{item.category}</td>
                                        <td style={{ color: 'purple' }}>{item.pay}</td>
                                        <td style={{ color: 'yellow' }}>{item.endTime}</td>
                                        <td style={{ color: 'pink' }}>{item.status}</td>
                                        <td>
                                            <button onClick={(e) => sumit(item.jobId, item.result)}>Details</button>
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