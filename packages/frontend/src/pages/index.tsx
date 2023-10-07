import Head from 'next/head'
import Layout from "@/components/layout"
import { Flex } from '@chakra-ui/react';
import { useCurrentUser, useLanding } from '../front-provider/src';
import Product from '../front/components/landing/product/Product';
import Technology from '../front/components/landing/technology/Technology';
import Community from '../front/components/landing/community/Community';
import Contact from '../front/components/landing/contact/Contact';
import Footer from '../front/components/landing/footer/Footer';
import { useRouter } from 'next/router';
import PerfectScrollbar from 'react-perfect-scrollbar';


export default function IndexPage() {
  const { user } = useCurrentUser();
  const { push, pathname } = useRouter();
  const { handleScroll } = useLanding();

  if (user && !pathname.includes('dashboard')) {
    push('/dashboard');
  }
  return (
    <Layout>
      <Head>
        <title>Home page</title>
      </Head>
      <PerfectScrollbar
      options={{ suppressScrollX: true, maxScrollbarLength: 160 }}
      onScrollY={handleScroll}
    >
      <Flex flexDir="column">
        <Product />
        <Technology />
        <Community />
        <Contact />
        <Footer />
      </Flex>
    </PerfectScrollbar>
    </Layout>
  )
}