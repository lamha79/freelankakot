import Head from 'next/head'
import Layout from "@/components/layout"
import { GreeterContractInteractions } from '@/components/web3/GreeterContractInteractions'


export default function IndexPage() {
  return (
    <Layout>
      <Head>
        <title>Home page</title>
      </Head>

      <section className='text-center py-10'>
        <h1 className='text-2xl'>Rocket Boilerplate</h1>
        <GreeterContractInteractions />
      </section>
    </Layout>
  )
}