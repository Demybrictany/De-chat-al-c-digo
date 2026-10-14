import React from 'react'
import FooterContent from './footer-content'

const DashCodeFooter = async () => {
    return (
        <FooterContent>
            <div className='text-center text-sm text-default-600 py-2'>
                {new Date().getFullYear()} Clínicas — Sistema de gestión clínica
            </div>
        </FooterContent>
    )
}

export default DashCodeFooter
