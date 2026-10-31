import { useState } from "react";

const Caja from './components/caja';
import {
    CRow,
    CCol,
    CCard,
    CCardBody,
    CCardHeader,
    CNav,
    CNavItem,
    CNavLink,
} from '@coreui/react'
import { DocsComponents, DocsExample } from 'src/components'


const Apertura = () => {
    // estados de caja 
    const [cajaAbierta, setCajaAbieta]=useState ('False');
    const [DatosCaja, setDatosCaja]=useState('null');
    const[MontoInicial, setMontoInicial]=useState('');

    const handleAbrirCaja = ()=> {
        e.preventDefault();
        if (!montoInicial) return;
            alert('Por favor ingresar un monto')
    }
    return (

        <CRow>
            <CCol xs={12}>
                <DocsComponents href="components/nav-tabs/" />
                <CCard className="mb-4">
                    <CCardHeader>
                        <a> MODULO CAJA </a>
                    </CCardHeader>
                    <CCardBody>
                        <p className="text-body-secondary small">
                            The base <code>.nav</code> component is built with flexbox and provide a strong
                            foundation for building all types of navigation components. It includes some style
                            overrides (for working with lists), some link padding for larger hit areas, and basic
                            disabled styling.
                        </p>
                        <DocsExample href="components/nav-tabs#base-nav">
                            <CNav>
                                <CNavItem>
                                    <CNavLink href="#" active>
                                        Active
                                    </CNavLink>
                                </CNavItem>
                                <CNavItem>
                                    <CNavLink href="#">Link</CNavLink>
                                </CNavItem>
                                <CNavItem>
                                    <CNavLink href="#">Link</CNavLink>
                                </CNavItem>
                                <CNavItem>
                                    <CNavLink href="#" disabled>
                                        Disabled
                                    </CNavLink>
                                </CNavItem>
                            </CNav>
                        </DocsExample>
                        <p className="text-body-secondary small">
                            Classes are used throughout, so your markup can be super flexible. Use{' '}
                            <code>&lt;ul&gt;</code>s like above, <code>&lt;ol&gt;</code> if the order of your
                            items is important, or roll your own with a <code>&lt;nav&gt;</code> element. Because
                            the .nav uses display: flex, the nav links behave the same as nav items would, but
                            without the extra markup.
                        </p>
                        <DocsExample href="components/nav-tabs#base-nav">
                            <CNav as="nav">
                                <CNavLink href="#" active>
                                    Active
                                </CNavLink>
                                <CNavLink href="#">Link</CNavLink>
                                <CNavLink href="#">Link</CNavLink>
                                <CNavLink href="#" disabled>
                                    Disabled
                                </CNavLink>
                            </CNav>
                        </DocsExample>
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
            )
}

            export default Caja;



