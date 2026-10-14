import { Metadata } from "next";

export const metadata:Metadata={
  title: 'Panel',
  description: 'Panel del sistema de gestión clínica'
}
const Layout = ({children}: {children: React.ReactNode}) => {
  return (
    <>
      {children}
    </>
  );
};

export default Layout;