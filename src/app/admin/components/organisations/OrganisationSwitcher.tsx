'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getOrganisations } from '@/services/organisationService';

export default function OrganisationSwitcher() {
    const [organisations, setOrganisations] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    // Extract current org ID from the path
    const pathParts = pathname.split('/');
    const currentOrgId = pathParts[1]; // The [orgId] from the path

    useEffect(() => {
        const loadOrganisations = async () => {
            const data = await getOrganisations();
            setOrganisations(data);
        };

        loadOrganisations();
    }, []);

    // Find current org details
    const currentOrg = organisations.find(org => org.id === currentOrgId);

    const switchToOrganisation = (orgId) => {
        setIsOpen(false);

        // If we're in an org-specific route, maintain the same page in the new org
        if (currentOrgId && pathParts.length > 2) {
            const subPath = pathParts.slice(2).join('/');
            router.push(`/${orgId}/${subPath}`);
        } else {
            // Otherwise just go to the org's main page
            router.push(`/${orgId}`);
        }
    };

    return (
        <div className="org-switcher">
        <button onClick={() => setIsOpen(!isOpen)}>
    {currentOrg ? currentOrg.name : 'Select Organisation'} ▼
      </button>

    {isOpen && (
        <div className="org-dropdown">
            {organisations.map(org => (
                    <div
                        key={org.id}
                className="org-option"
                onClick={() => switchToOrganisation(org.id)}
    >
        {org.name}
        </div>
    ))}
        <div className="divider"></div>
            <div
        className="org-option new-org"
        onClick={() => router.push('/organisations/create')}
    >
        + Create New Organisation
    </div>
    </div>
    )}
    </div>
);
}