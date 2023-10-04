import Head from 'next/head'
import Layout from "@/components/layout"

export default function IndexPage() {
    return (
        <Layout>
            <Head>
                <title>About Page</title>
            </Head>
            
            <section className='text-center py-10'>
                <h1 className='text-2xl'>About Page</h1>
            </section>
        </Layout>
    )
}