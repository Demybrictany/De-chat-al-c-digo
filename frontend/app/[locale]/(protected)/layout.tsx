import LayoutProvider from "@/providers/layout.provider";
import LayoutContentProvider from "@/providers/content.provider";
import DashCodeSidebar from '@/components/partials/sidebar'
import DashCodeFooter from '@/components/partials/footer'
import DashCodeHeader from '@/components/partials/header'
import { auth } from "@/lib/auth";
import { redirect } from "@/components/navigation";
const layout = async ({ children }: { children: React.ReactNode }) => {
    const session = await auth();

    if (!session) {
        // Unico locale del proyecto: 'es' (ver config/index.ts).
        redirect({ href: '/', locale: 'es' })
    }
    return (
        <LayoutProvider >
            <DashCodeHeader />
            <DashCodeSidebar />
            <LayoutContentProvider>
                {children}
            </LayoutContentProvider>
            <DashCodeFooter />
        </LayoutProvider>
    )


};

export default layout;
